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

  classes: [
    {
      name: 'Identifier',
      properties: [
        {
          class: 'String',
          documentation: 'Name of Definition the diff is performed on.',
          name: 'name',
        },
        {
          class: 'String',
          documentation: 'Tracks the left path to the property of the AST node.',
          name: 'leftKey',
        },
        {
          class: 'String',
          documentation: 'Tracks the right path to the property of the AST node.',
          name: 'rightKey',
        },
        {
          class: 'Array',
          of: 'String',
          documentation: 'Sources from which left definition is composed.',
          name: 'leftSources',
        },
        {
          class: 'Array',
          of: 'String',
          documentation: 'Sources from which right definition is composed.',
          name: 'rightSources',
        },
      ],
    },
  ],

  properties: [
    {
      class: 'Array',
      of: 'String',
      documentation: `Properties that are ignored during diff. These properties
          are either internal properties used by the program or properties that
          will always be different (e.g. id, sources) by nature.`,
      name: 'excludedProps',
      factory: function() {
        return ['id', 'isCanonical', 'sources', 'source'];
      },
    },
  ],

  methods: [
    {
      documentation: `Expects to receive two maps of canonicalized definitions.
          A diff will be performed for each definition, and an array of
          DiffChunks will be returned for each difference found.`,
      name: 'diff',
      args: [
        {
          documentation: `Map of AST Definition nodes corresponding to a
              source. The key of the map is the name of the definition.
              The definitions are used on the left side of the diff.`,
          name: 'left',
          typeName: 'Object',
        },
        {
          documentation: `Map of AST Definition nodes corresponding to a
              source. The key of the map is the name of the definition.
              The definitions are used on the right side of the diff.`,
          name: 'right',
          typeName: 'Object',
        },
      ],
      returns: 'Array',
      code: function(left, right) {
        var chunks = []; // Array of DiffChunks that are produced from diff.

        // Calculate union of leftKeys and rightKeys.
        var leftKeys = Object.keys(left);
        var rightKeys = Object.keys(right);
        var keys = leftKeys.concat(rightKeys);
        keys = keys.filter(function(key, index) {
          return keys.indexOf(key) === index;
        });

        // Iterate through definitions and perform diff.
        keys.forEach(function(key) {
          // If an Enum or Typedef is defined multiple times in
          // the same source (e.g. WebKit), we will get an array of items.
          // These definitions are retained by Canonicalizer and placed
          // into an array. These definitions should be the same.
          // FUTURE: Handle multi definitions that are NOT the same.
          if (Array.isArray(left[key])) this.dedupDefinition_(left, key);
          if (Array.isArray(right[key])) this.dedupDefinition_(right, key);

          // Perform diff with id object to track path and source.
          var id = this.Identifier.create({
            name: key,
            leftSources: left[key] ? left[key].sources : [],
            rightSources: right[key] ? right[key].sources : [],
          });

          this.diff_(left[key], right[key], id, chunks);
        }.bind(this));

        return chunks;
      },
    },
    {
      documentation: `defnMap[key] should be an array of Definition AST nodes
          with key as the name of the definition. If all definitions are the
          same (i.e. they have the same members), the entry is replaced
          with a reference definition.`,
      name: 'dedupDefinition_',
      args: [
        {
          documentation: 'A map of Definition AST nodes for a given source.',
          name: 'defnMap',
          typeName: 'Object',
        },
        {
          documentation: `Name of the Definition that was defined multiple times
              in the given source.`,
          name: 'key',
          typeName: 'String',
        },
      ],
      returns: '',
      code: function(defnMap, key) {
        var id = this.Identifier.create({name: key});
        var defns = defnMap[key];

        var refDefn = defns[0];
        for (var i = 1; i < defns.length; i++) {
          var changes = [];
          this.diff_(refDefn, defns[i], id, changes);

          if (changes.length !== 0) {
            // Cannot handle different definitions right now.
            delete defnMap[key];
            console.error(`Diff: ${key} was defined multiple times.
                The definitions were not identical!`);
            return;
          }
        }

        // Concatenate the list of sources.
        var sources = defnMap[key].reduce(function(srcArr, def) {
          return srcArr.concat(def.sources);
        }, []);

        // Use first object as reference object.
        defnMap[key] = defnMap[key][0];
        defnMap[key].sources = sources;
      },
    },
    {
      documentation: `Given id, status, and left and right, a DiffChunk is
          created. The change is then placed into the array changes.`,
      name: 'addChunk_',
      args: [
        {
          documentation: 'Identification information for the diff chunk.',
          name: 'id',
          typeName: 'Identifier',
        },
        {
          documentation: 'Status information about the diff chunk.',
          name: 'status',
          typeName: 'org.chromium.webidl.DiffStatus',
        },
        {
          documentation: 'The value of the left side of the diff chunk.',
          name: 'left',
        },
        {
          documentation: 'The value of the right side of the diff chunk.',
          name: 'right',
        },
        {
          documentation: 'The array tracking diff chunks that are produced.',
          name: 'changes',
          typeName: 'Array',
        },
      ],
      returns: '',
      code: function(id, status, left, right, changes) {
        var chunk = this.DiffChunk.create({
          definitionName: id.name,
          status: status,
          leftKey: id.leftKey,
          leftValue: left,
          leftSources: id.leftSources,
          rightKey: id.rightKey,
          rightValue: right,
          rightSources: id.rightSources,
        });
        changes.push(chunk);
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
      args: [
        {
          documentation: 'Value of the left side that is diffed.',
          name: 'left',
        },
        {
          documentation: 'Value of the right side that is diffed.',
          name: 'right',
        },
        {
          documentation: 'Identification information for the diff chunk.',
          name: 'id',
          typeName: 'Identifier',
        },
        {
          documentation: 'The array tracking diff chunks that are produced.',
          name: 'changes',
          typeName: 'Array',
        },
      ],
      returns: '',
      code: function (left, right, id, changes) {
        if (left === undefined || left === null ||
            right === undefined || right === null) {
          if (left !== right)
            this.addChunk_(id, this.DiffStatus.MISSING_DEFINITION, left,
                right, changes);
          return;
        }

        // Determine types and whether a direct comparison can be done.
        var leftType = foam.typeOf(left);
        var rightType = foam.typeOf(right);
        foam.assert(leftType === rightType,
            'Diff: Encountered a type mismatch!');

        // Type is a basic type, perform simple comparison.
        if (leftType === foam.Boolean || leftType === foam.Number ||
            leftType === foam.String ) {
          if (left !== right)
            this.addChunk_(id, this.DiffStatus.VALUES_DIFFER, left,
                right, changes);
          return;
        }

        // Left and right are either Array or Objects at this point.
        if (leftType === foam.Array) {
          this.arrayCmp_(left, right, id, changes);
        } else {
          foam.assert(leftType !== foam.Object && rightType !== foam.Object,
              'Diff: Cannot find class property of object.');

          var leftProps = left.cls_.getAxiomsByClass(foam.core.Property);
          var rightProps = right.cls_.getAxiomsByClass(foam.core.Property);

          // Perform a diff on all common properties.
          var props = leftProps.concat(rightProps);
          props = props.filter(function(prop, index) {
            return props.indexOf(prop) === index;
          });

          props.forEach(function(prop) {
            var propName = prop.name;
            if (this.excludedProps.includes(propName)) return;

            var nextId = id.clone();
            nextId.leftKey = nextId.rightKey +=
                `${id.leftKey ? '.' : ''}${propName}`;
            this.diff_(left[prop], right[prop], nextId, changes);
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
      args: [
        {
          documentation: 'Value of the left side that is diffed.',
          name: 'left',
        },
        {
          documentation: 'Value of the right side that is diffed.',
          name: 'right',
        },
        {
          documentation: 'Identification information for the diff chunk.',
          name: 'id',
          typeName: 'Identifier',
        },
        {
          documentation: 'The array tracking diff chunks that are produced.',
          name: 'changes',
          typeName: 'Array',
        },
      ],
      returns: '',
      code: function arrayCmp_(left, right, id, changes) {
        // leftMatched and rightMatched tracks which elements of
        // left and right have been previously paired up.
        var leftMatched = [];
        var rightMatched = [];
        // Work on clones to prevent altering original data.
        left = foam.Array.clone(left);
        right = foam.Array.clone(right);

        for (var i = 0; i < left.length; i++) {
          for (var j = 0; j < right.length; j++) {
            var leftName = left[i].id;
            var rightName = right[j].id;

            // If names differ, they are definitely not the same.
            if (rightMatched[j] || leftName !== rightName) continue;

            // Both items have no names, or they have same names at this point.
            // Perform a diff with 'changes' so the chunks are not immediately
            // persisted.
            var tempChanges = [];

            var nextId = id.clone();
            nextId.leftKey += `.${i}`;
            nextId.rightKey += `.${j}`;
            this.diff_(left[i], right[j], nextId, tempChanges);

            // No differences found or they have the same name.
            if (tempChanges.length === 0 || leftName && rightName) {
              // If they have same name and changes were found,
              // push changes from tempChanges into this.chunks.
              // This is done instead of Array.concat to prevent
              // creating a new array (invalidating all other references).
              Array.prototype.push.apply(changes, tempChanges);
              leftMatched[i] = rightMatched[j] = true;
              break;
            }
          }

          // No match was found for left item.
          if (!leftMatched[i])
            this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_RIGHT, left[i],
                undefined, changes);
        }

        // All remaining items in right array need to go into diff chunk now.
        right.forEach(function(rightObj, i) {
          if (!rightMatched[i])
            this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_LEFT, undefined,
                rightObj, changes);
        }.bind(this));
      },
    }
  ],
});
