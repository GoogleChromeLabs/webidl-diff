// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.defineAccumulatorBox = function() {
  foam.CLASS({
    package: 'org.chromium.webidl.test',
    name: 'AccumulatorBox',
    implements: ['foam.box.Box'],

    properties: [
      {
        class: 'Array',
        name: 'results',
      },
    ],

    methods: [
      function send(message) {
        this.results.push(message.object);
      },
    ],
  });
};
