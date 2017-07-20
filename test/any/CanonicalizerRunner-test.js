// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('CanonicalizerRunner', function() {
  var CanonicalizerRunner;
  var PipelineMessage;
  var ResultBox;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.Test',
      name: 'ResultBox',
      implements: ['foam.box.Box'],

      properties: [
        {
          class: 'Array',
          name: 'results',
        },
      ],

      methods: [
        function send(msg) {
          this.results.push(msg);
        },
        function clear() {
          this.results = [];
        }
      ]
    });

    CanonicalizerRunner = foam.lookup('org.chromium.webidl.CanonicalizerRunner');
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    ResultBox = foam.lookup('org.chromium.webidl.Test.ResultBox');
  });

  it('should send an error if invalid arguments are received as message', function() {
    var wrongObj = {};
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();

    var runner = CanonicalizerRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);

    var missingArgs = PipelineMessage.create();
    runner.run(missingArgs);
    expect(errorBox.results.length).toBe(2);
  });

  // More tests to be added...
});
