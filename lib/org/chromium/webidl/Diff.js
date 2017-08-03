// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Diff',

  requires: [
    'org.chromium.webidl.DiffChunk',
    'org.chromium.webidl.DiffStatus',
  ],

  documentation: `The diff algorithm that is performed on canonicalized
    definitions.`,

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.DiffChunk',
      name: 'chunks',
    },
    {
      name: 'excludedProps',
      value: [ 'id', 'isCanonical', 'sources', 'source' ],
    },
  ],

  methods: [
    {
      documentation: `diff expects to receive two maps of canonicalized
        definitions. A diff will be performed for each definition, and an
        array of DiffChunks will be returned for each difference found.`,
      name: 'diff',
      returns: 'Array',
      code: function(left, right) {
        this.chunks = [];

        // Calculate union of leftKeys and rightKeys.
        var leftKeys = Object.keys(left);
        var rightKeys = Object.keys(right);

        var keys = leftKeys.concat(rightKeys);
        keys = keys.filter(function(key, index) {
          return keys.indexOf(key) === index;
        });

        keys.forEach(function(key) {
          // If we have an array of items (e.g. Enums / Typedef),
          // these definitions should be the same.
          // FUTURE: Handle multi definitions that are NOT the same.
          if (Array.isArray(left[key])) this.dedupDefinition_(left, key);
          if (Array.isArray(right[key])) this.dedupDefinition_(right, key);

          // Perform diff with id object to track path and source.
          var id = {
            name: key,
            path: '',
            leftSources: left[key] ? left[key].sources : null,
            rightSources: right[key] ? right[key].sources : null,
          };

          this.diff_(left[key], right[key], id);
        }.bind(this));
        return this.chunks;
      },
    },
    {
      documentation: `Given an array of definitions with the same name,
        determine if all definitions are the same. If the definitions are all
        the same (i.e. they have the same members), the entry is replaced
        with a reference definition.`,
      name: 'dedupDefinition_',
      code: function(defns, key) {
        var changes = [];
        var id = { name: key, path: '' };

        this.diff_(defns[key], defns[key], id, changes);
        foam.assert(changes.length === 0,
            `Diff: ${key} was defined multiple times.
            The definitions were not identical!`);

        // Concatenate the list of sources.
        var sources = defns[key].reduce(function(srcArr, def) {
          return srcArr.concat(def.sources);
        }, []);

        // Use first object as reference object.
        defns[key] = defns[key][0];
        defns[key].sources = sources;
      },
    },
    {
      documentation: `Given id (type: { name: String, path: String }),
        status (type: DiffStatus), and left and right, a DiffChunk is created.
        If opt_changes is provided, the DiffChunk is placed in opt_changes.
        Otherwise, it is placed in the array of chunks that is returned.`,
      name: 'addChunk_',
      code: function(id, status, left, right, opt_changes) {
        var chunk = this.DiffChunk.create({
          definitionName: id.name,
          status: status,
          propPath: id.path,
          leftValue: left,
          leftSources: id.leftSources,
          rightValue: right,
          rightSources: id.rightSources,
        });

        if (opt_changes) opt_changes.push(chunk);
        else this.chunks.push(chunk);
      },
    },
    {
      documentation: `If left and right are of primative types, then a direct
        comparison will be performed and a DiffChunk is created. If left and
        right are both arrays, a comparison will be performed between the
        items. If left and right are objects, it will attempt to recursively
        traverse properties common to both objects. Traversal ends when a
        difference is found or there is no more properties to compare.`,
      name: 'diff_',
      returns: '',
      code: function (left, right, id, opt_changes) {
        if (left === undefined || left === null ||
            right === undefined || right === null) {
          if (left !== right)
            this.addChunk_(id, this.DiffStatus.MISSING_DEFINITION, left,
                right, opt_changes);
          return;
        }

        // Determine types and whether a direct comparison can be done.
        var leftType = typeof(left);
        var rightType = typeof(right);
        var isLeftArray = Array.isArray(left);
        var isRightArray = Array.isArray(right);
        foam.assert(leftType === rightType && isLeftArray === isRightArray,
            'Diff: Encountered a type mismatch!');

        // Type is a basic type, perform simple comparison.
        if (['boolean', 'number', 'string'].includes(leftType)) {
          if (left !== right)
            this.addChunk_(id, this.DiffStatus.VALUES_DIFFER, left,
                right, opt_changes);
          return;
        }

        // Left and right are either Array or Objects at this point.
        if (isLeftArray) {
          this.arrayCmp_(left, right, id, opt_changes);
        } else {
          foam.assert(left.cls_ && right.cls_,
              'Diff: Cannot find class property of object.');

          var leftProps = left.cls_.getAxiomsByClass(foam.core.Property);
          var rightProps = right.cls_.getAxiomsByClass(foam.core.Property);
          
          // Determine if left and right have the same properties.
          if (foam.util.compare(leftProps, rightProps) !== 0) {
            // Cannot perform a deep comparison of the objects.
            this.addChunk_(id, this.DiffStatus.VALUES_DIFFER, left,
                right, opt_changes);
            return;
          }

          // leftProp and rightProp are same at this point.
          // Perform diff on each of the objects properties.
          leftProps.forEach(function(prop) {
            var propName = prop.name;
            if (this.excludedProps.includes(propName)) return;

            var nextId = Object.assign({}, id,
                { path: id.path.concat(`.${propName}`) });
            this.diff_(left[prop], right[prop], nextId, opt_changes);
          }.bind(this));
        }
      },
    },
    {
      documentation: `Performs a comparison between members of left and
        members of right. If no differences are found between two objects,
        they are considered to be matched and removed from the remaining
        comparisons. Once all members have been compared, a DiffChunk is
        generated for all unmatched members.`,
      name: 'arrayCmp_',
      returns: '',
      code: function arrayCmp_(left, right, id, opt_changes) {
        // Items will be removed from the array once matched.
        // Work on clones to prevent altering original data.
        left = foam.Array.clone(left);
        right = foam.Array.clone(right);

        var matched = false;
        for (var i = 0; i < left.length; i++) {
          for (var j = 0; j < right.length; j++) {
            // Get id field of left and right.
            var leftName = left[i].id;
            var rightName = right[j].id;

            // If names differ, they are definitely not the same.
            if (leftName !== rightName) continue;
            if (!leftName && !rightName) {
              // These items have no names. Perform a diff with changes
              // to determine whether these items are the same.
              var changes = opt_changes || [];
              var initLen = changes.length;

              var nextId = Object.assign({}, id,
                  { path: id.path.concat(`[${leftName}]`) });
              this.diff_(left[i], right[j], nextId, changes);

              // No differences were found between the two objects.
              if (changes.length === initLen) {
                matched = true;
                break;
              }
            } else {
              // Names are the same. Perform a diff of definition.
              var nextId = nextId = Object.assign({}, id,
                  { path: id.path.concat(`[${leftName}]`) });
              this.diff_(left[i], right[j], nextId);

              matched = true;
              break;
            }
          }

          if (matched === true) {
            // A match on the right was found for the item on the left.
            right.splice(j, 1);
            matched = false;
          } else {
            this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_RIGHT, left[i],
                undefined, opt_changes);
          }
        }

        // All remaining items in right array need to go into diff chunk now.
        right.forEach(function(rightObj) {
          this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_LEFT, undefined,
              rightObj, opt_changes);
        }.bind(this));
      },
    }
  ],
});
