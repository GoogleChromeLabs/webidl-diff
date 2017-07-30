// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Diff',

  requires: ['org.chromium.webidl.DiffChunk'],

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
    function addChunk_(name, status, path, left, right, opt_changes) {
      var chunk = this.DiffChunk.create({
        name: name,
        status: status,
        propPath: path,
        leftKey: left,
        leftValue: left,
        rightKey: right,
        rightValue: right,
      });

      if (opt_changes) opt_changes.push(chunk);
      else this.chunks.push(chunk);
    },
    function diff(left, right) {
      // Left and right are maps are definitions.
      // Determine union of leftKeys and rightKeys.
      var leftKeys = Object.keys(left);
      var rightKeys = Object.keys(right);

      var keys = leftKeys.concat(rightKeys);
      keys = keys.filter(function(key, index) {
        return keys.indexOf(key) === index;
      });

      keys.forEach(function(key) {
        var id = { name: key, path: '' };
        this.diff_(left[key], right[key], id);
      }.bind(this));
    },
    function diff_(left, right, id, opt_changes) {
      // Determine if either left or right is undefined.
      if (!left && right || left && !right) {
        this.addChunk_(id.name, 'Missing left || right', id.path, left, right, opt_changes);
        return;
      }

      // Determine the types of left and right.
      var leftType = typeof(left);
      var rightType = typeof(right);

      if (leftType !== rightType) {
        // Cannot handle mismatched types... yet.
        throw new Error('Diff encountered a type mismatch');
      }

      // Type is a basic type... we can just compare.
      if (['boolean', 'number', 'string'].includes(leftType)) {
        if (left !== right)
          this.addChunk_(id.name, 'Difference found!', id.path, left, right, opt_changes);
        return;
      }

      // Left and right are either Array or Objects at this point.
      var isLeftArray = Array.isArray(left);
      var isRightArray = Array.isArray(right);
      foam.assert(isLeftArray === isRightArray, 'Diff encountered a type mismatch');

      if (isLeftArray) {
        this.arrayCmp_(left, right, id);
      } else {
        // We have objects. We can directly manipulate them...
        // Determine if the clases are the same.
        var leftCls = left.cls_.name || null;
        var rightCls = left.cls_.name || null;

        foam.assert(leftCls && rightCls, 'Diff cannot find class?');
        foam.assert(leftCls === rightCls, 'Diff encountered a type mismatch');

        // Use leftCls since it is same as right class.
        var props = left.cls_.getAxiomsByClass(foam.core.Property);
        props.forEach(function(prop) {
          var propName = prop.name;
          if (this.excludedProps.includes(propName)) return;

          var nextId = { name: id.name, path: id.path.concat(`.${propName}`) };
          this.diff_(left[prop], right[prop], nextId);
          // Call diff again, but append id onto name first.
        }.bind(this));
      }
    },
    function arrayCmp_(left, right, id) {
      // Check to see if length is the same.
      // Perform greedy algorithm! Once we find a match, remove from both list.

      // Work on clones of the array.
      left = foam.Array.clone(left);
      right = foam.Array.clone(right);

      var matched = false;

      // TODO: May need to check and swap order... depending on whats larger.
      left.forEach(function(leftObj, leftIndex) {
        var changesArr = [];
        right.some(function(rightObj, rightIndex) {
          // Perform a diff with changes
          var changes = [];
          // TODO: What do we do with ID....
          this.diff_(leftObj, rightObj, id, changes);

          // Potential short circuit opportunity...
          if (changes.length === 0) {
            right.splice(rightIndex, 1);
            matched = true;
            return true;
          }
          // Otherwise, just push it to array of changes.
          changesArr.push(changes);
        }.bind(this));
        // Inner loop broke.
        if (matched == true) {
          matched = false;
        } else {
          // What do we do if there is no exact match?!
          console.warn('NOT FULLY IMPLEMENTED YET');
          this.addChunk_(id.name, 'Missing definition on right', id.path, left, right);
          //throw new Error('Not implemented yet!');
        }
      }.bind(this));
    },
  ],
});
