// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'DiffStatus',

  values: [
    {
      name: 'LEFT_MISSING_DEFINITION',
      label: 'Left missing definition',
    },
    {
      name: 'RIGHT_MISSING_DEFINITION',
      label: 'Right missing definition',
    },
  ],
});

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Diff',

  requires: [ 'org.chromium.webidl.DiffChunk' ],

  documentation: 'The diff algorithm.',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.DiffChunk',
      name: 'chunks',
    },
  ],

  methods: [
    function diff(left, right) {
      // Params: Left and right should be maps of definitions.

      // Determine the keys present in left and right.
      var leftKeys = Object.keys(left);
      var rightKeys = Object.keys(right);

      // Compare keys.
      this.definitionCmp(leftKeys, rightKeys);


    },
    function definitionCmp(leftKeys, rightKeys) {
      var diff = foam.Array.diff(leftKeys, rightKeys);
      var leftMissing = diff.added;
      var rightMissing = diff.removed;

      //leftMissing.forEach(

    },
  ],
});
