// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('LocalGitRunner test', function() {
  var LocalGitRunner;
  var AccumulatorBox;
  var defaultErrorBox;
  var defaultOutputBox;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'AccumulatorBox',
      implements: [ 'foam.box.Box' ],

      properties: [
        {
          class: 'Array',
          name: 'outputs',
        },
      ],

      methods: [
        function send(message) {
          this.outputs.push(message.object);
        },
        function clear() { this.outputs = []; }
      ]
    });
    AccumulatorBox = foam.lookup('foam.box.pipeline.test.AccumulatorBox');
    LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
    defaultOutputBox = AccumulatorBox.create();
    defaultErrorBox = AccumulatorBox.create();
  });

  it('should set properties correctly on run', function() {
    
  });
});
