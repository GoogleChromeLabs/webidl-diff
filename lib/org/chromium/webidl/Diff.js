// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'DiffStatus',

  values: [
    {
      name: 'MISSING_DEFINITION',
      label: 'Definition not found for one of the sources.',
    },
    {
      name: 'VALUES_DIFFER',
      label: 'Values differ.'
    },
    {
      name: 'NO_MATCH_ON_LEFT',
      label: 'No match found on the left side.',
    },
    {
      name: 'NO_MATCH_ON_RIGHT',
      label: 'No match found on the right side.',
    },
  ],
});

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Diff',

  requires: [
    'org.chromium.webidl.DiffChunk',
    'org.chromium.webidl.DiffStatus',
  ],

  documentation: 'The diff algorithm?',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.DiffChunk',
      name: 'chunks',
    },
    {
      //class: 'Array',
      //of: 'String',
      name: 'excludedProps',
      value: [ 'id', 'isCanonical', 'sources', 'source' ],
    },
  ],

  methods: [
    function addChunk_(id, status, left, right, opt_changes) {
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
    function diff(left, right) {
      // Left and right are maps of definitions.
      // Clear previous chunks.
      this.chunks = [];

      // Calculate union of leftKeys and rightKeys.
      var leftKeys = Object.keys(left);
      var rightKeys = Object.keys(right);

      var keys = leftKeys.concat(rightKeys);
      keys = keys.filter(function(key, index) {
        return keys.indexOf(key) === index;
      });

      // Iterate through each of the keys and perform diff.
      keys.forEach(function(key) {
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
    function diff_(left, right, id, opt_changes) {
      // Determine if either left or right is undefined.
      if (!left && right || left && !right) {
        this.addChunk_(id, this.DiffStatus.MISSING_DEFINITION, left, right, opt_changes);
        return;
      }

      // Determine the types of left and right.
      var leftType = typeof(left);
      var rightType = typeof(right);
      // Cannot handle mismatched types.
      foam.assert(leftType === rightType, 'Diff: Encountered a type mismatch!');

      // Type is a basic type. Perform simple comparison.
      if (['boolean', 'number', 'string'].includes(leftType) || left === null || right === null) {
        if (left !== right)
          this.addChunk_(id, this.DiffStatus.VALUES_DIFFER, left, right, opt_changes);
        return;
      }

      // Left and right are either Array or Objects at this point.
      var isLeftArray = Array.isArray(left);
      var isRightArray = Array.isArray(right);
      foam.assert(isLeftArray === isRightArray,
          'Diff: Encountered a type mismatch!');

      if (isLeftArray) {
        this.arrayCmp_(left, right, id, opt_changes);
      } else {
        // Determine if the clases are the same.
        var leftCls = left.cls_.name || null;
        var rightCls = left.cls_.name || null;

        foam.assert(leftCls && rightCls, 'Diff: Cannot find class property of object.');
        foam.assert(leftCls === rightCls, 'Diff: Encountered a type mismatch!');

        // Use leftCls since it is same as right class.
        var props = left.cls_.getAxiomsByClass(foam.core.Property);
        props.forEach(function(prop) {
          var propName = prop.name;
          if (this.excludedProps.includes(propName)) return;

          var nextId = Object.assign({}, id, { path: id.path.concat(`.${propName}`) });
          this.diff_(left[prop], right[prop], nextId, opt_changes);
          // Call diff again, but append id onto name first.
        }.bind(this));
      }
    },
    function arrayCmp_(left, right, id, opt_changes) {
      // Perform greedy algorithm!
      // Once we find a match, remove from inner list.
      // If no match, then we add outer item into list.
      // Once all outer items are processed, all remaining inner items added to list.

      // Work on clones of the array.
      left = foam.Array.clone(left);
      right = foam.Array.clone(right);

      var matched = false;

      for (var i = 0; i < left.length; i++) {
        var changesArr = [];
        for (var j = 0; j < right.length; j++) {
          // Get id field of left and right.
          var leftName = left[i].id;
          var rightName = right[j].id;
          // If names are the same, we do direct diff.
          // We don't care if there are differences.
          if (!leftName || !rightName || leftName !== rightName) {
            // Perform a diff with changes as arg.
            var changes = opt_changes || [];
            var initLen = changes.length;

            var nextId = Object.assign({}, id, { path: id.path.concat(`[${leftName}/${rightName}]`) });
            this.diff_(left[i], right[j], nextId, changes);

            // Cannot be perfect match at this point.
            // If it meets a threshold, we consider it a match.
            if (changes.length === initLen) {
              right.splice(j, 1);
              matched = true;
              break;
            }
            // Otherwise, just push it to array of changes.
            changesArr.push(changes);
          } else {
            // Names are the same. Thus, we return perform a diff of definition.
            var nextId = nextId = Object.assign({}, id, { path: id.path.concat(`[${leftName}]`) });
            this.diff_(left[i], right[j], nextId); // No changes pushed.

            right.splice(j, 1);
            matched = true;
            break;
          }
        }

        // Inner loop broke.
        if (matched === true) {
          matched = false;
        } else {
          // What do we want to do if there is no exact match?!
          this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_RIGHT, left[i], undefined, opt_changes);
        }
      }

      // All remaining items in right array need to go into diff chunk now.
      right.forEach(function(rightObj) {
        this.addChunk_(id, this.DiffStatus.NO_MATCH_ON_LEFT, undefined, rightObj, opt_changes);
      }.bind(this));
    },
  ],
});
