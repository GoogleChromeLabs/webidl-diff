// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('PipelineRunner', function() {
  var PipelineRunner;
  var TestObj;
  var outputBox;
  var errorBox;
  var runner;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'TestObj',
      properties: [
        {
          class: 'String',
          name: 'id',
        },
      ],
    });
    TestObj = foam.lookup('org.chromium.webidl.test.TestObj');
    PipelineRunner = foam.lookup('org.chromium.webidl.PipelineRunner');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    outputBox = AccumulatorBox.create();
    errorBox = AccumulatorBox.create();
  });

  it('should send the message to outputBox on call to output', function() {
    var runner = PipelineRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    runner.output('Test');
    expect(errorBox.results.length).toBe(0);
    expect(outputBox.results.length).toBe(1);
    expect(outputBox.results[0]).toBe('Test');
  });

  it('should send the message to outputBox and DAO if outputDAO exists', function(done) {
    var dao = foam.dao.MDAO.create({of: 'org.chromium.webidl.test.TestObj'});
    var ctx = foam.createSubContext({
      getDAO: function() { return dao; },
    });

    var runner = PipelineRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    }, ctx);

    var msg = TestObj.create({id: 'Test'});
    runner.output(msg);
    expect(errorBox.results.length).toBe(0);
    expect(outputBox.results.length).toBe(1);
    expect(outputBox.results[0]).toBe(msg);

    dao.find('Test').then(function(result) {
      expect(result).toBe(msg);
      done();
    });
  });
});
