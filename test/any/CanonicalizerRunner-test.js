// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('CanonicalizerRunner', function() {
  var IDLFile;
  var IDLFileContents;
  var Parser;
  var PipelineMessage;
  var WebPlatformEngine;

  var outputBox;
  var errorBox;
  var runner;
  var waitTime = 3; // 3 seconds before callback.

  beforeEach(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    Parser = foam.lookup('org.chromium.webidl.Parser');
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    var CanonicalizerRunner = foam.lookup('org.chromium.webidl.CanonicalizerRunner');

    outputBox = AccumulatorBox.create();
    errorBox = AccumulatorBox.create();
    runner = CanonicalizerRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
      waitTime: waitTime,
    });
  });

  it('should send an error if invalid arguments are received as message', function() {
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);

    var missingArgs = PipelineMessage.create();
    runner.run(missingArgs);
    expect(errorBox.results.length).toBe(2);
  });

  it('should put IDL files together and return the canonical IDL file', function(done) {
    // Setting up files for canonicalization.
    var repository = 'https://chromium.googlesource.com/chromium/src.git';
    var revision = '33c0cac5413dc579185641ffa5b8ff6ee81a05b2';

    var firstIdlFile = IDLFileContents.create({
      metadata: IDLFile.create({
        repository: repository,
        revision: revision,
        path: 'third_party/WebKit/Source/core/workers/SharedWorker.idl',
      }),
      contents: `
        interface SharedWorker : EventTarget {
          readonly attribute MessagePort port;
        };`,
    });

    var secondIdlFile = IDLFileContents.create({
      metadata: IDLFile.create({
        repository: repository,
        revision: revision,
        path: 'third_party/WebKit/Source/core/timing/SharedWorkerPerformance.idl',
      }),
      contents: `
        partial interface SharedWorker {
          [CallWith=ScriptState, Measure] readonly attribute DOMHighResTimeStamp workerStart;
        };`,
    });

    // Perform a quick parse on the files to get AST.
    var firstAst = Parser.create().parseString(firstIdlFile.contents).value;
    var secondAst = Parser.create().parseString(secondIdlFile.contents).value;

    // Prepare message for CanonicalizerRunner.
    var firstMessage = PipelineMessage.create({
      ast: firstAst,
      idlFile: firstIdlFile,
      source: WebPlatformEngine.BLINK,
    });

    var secondMessage = PipelineMessage.create({
      ast: secondAst,
      idlFile: secondIdlFile,
      source: WebPlatformEngine.BLINK,
    });

    runner.run(firstMessage);
    runner.run(secondMessage);
    // Expect results to take ~3 seconds to arrive.
    // To be safe, check 1.5 seconds afterwards.
    setTimeout(function() {
      expect(errorBox.results.length).toBe(0);
      expect(outputBox.results.length).toBe(1);

      var canonicalInterfaces = outputBox.results[0];
      // We only expect one interface.
      expect(canonicalInterfaces.length).toBe(1);
      var canonical = canonicalInterfaces[0];

      // Expecting interface to have 2 members.
      expect(canonical.definition.members.length).toBe(2);

      // Expecting definition to reference 2 sources.
      expect(canonical.ref.length).toBe(2);

      // Expecting defintion to retain inheritance.
      expect(canonical.definition.inheritsFrom).toBeDefined();
      done();
    }, (waitTime + 1.5) * 1000);
  });
});
