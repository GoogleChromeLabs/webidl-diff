// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Parser Runner', function() {
  var ParserRunner;
  var PipelineMessage;
  var IDLFileContents;
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

    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner');
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    ResultBox = foam.lookup('org.chromium.webidl.Test.ResultBox');
  });

  it('should send an error if invalid arguments are received as message', function() {
    var wrongObj = {};
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();

    var runner = ParserRunner.create({
      outputBox: outputBox,
      errorBox: errorBox
    });

    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);

    var missingParser = PipelineMessage.create({
      idlFile: IDLFileContents.create()
    });
    runner.run(missingParser);
    expect(errorBox.results.length).toBe(2);

    var missingFile = PipelineMessage.create({
      parserClass: foam.lookup('org.chromium.webidl.Parser'),
    });
    runner.run(missingFile);
    expect(errorBox.results.length).toBe(3);
    expect(outputBox.results.length).toBe(0);
  });

  it('should send an error to errorBox if parsing with incorrect parser', function() {
    var defaultOutputBox = ResultBox.create();
    var defaultErrorBox = ResultBox.create();

    // Test details: An IDL file with preprocessor directives will be used. The
    // Blink parser is not capable of parsing preprocessor directives and the
    // test is expected to fail if the correct parser is injected.

    var idlFile = IDLFileContents.create({
      metadata: null, // For the purpose of this test, this field is irrelevant.
      contents: `
        #define FOO 42
        interface Location {
          stringifier attribute USVString href;
        };`,
    });

    var runner = ParserRunner.create({
      outputBox: defaultOutputBox,
      errorBox: defaultErrorBox,
    });

    // Expect parsing with the wrong parser to fail.
    var incorrectParser = PipelineMessage.create({
      idlFile: idlFile,
      parserClass: foam.lookup('org.chromium.webidl.Parser'), // Specifying Blink Parser.
    });

    runner.run(incorrectParser);
    expect(defaultOutputBox.results.length).toBe(0);
    expect(defaultErrorBox.results.length).toBe(1);
  });

  it('should parse file with the correct parser and return message with results', function() {
    var defaultOutputBox = ResultBox.create();
    var defaultErrorBox = ResultBox.create();

    // Test details: An IDL file with preprocessor directives will be used. The
    // WebKit parser is capable of parsing preprocessor directives and the test
    // is expected to succeed if the correct parser is injected.

    var idlFile = IDLFileContents.create({
      metadata: null,
      contents: `
        #define FOO 42
        interface Location {
          stringifier attribute USVString href;
        };`,
    });

    var runner = ParserRunner.create({
      outputBox: defaultOutputBox,
      errorBox: defaultErrorBox,
    });

    // Expect parsing with the right parser to yield results.
    var correctParser = PipelineMessage.create({
      idlFile: idlFile,
      parserClass: foam.lookup('org.chromium.webidl.WebKitParser'),
    });

    runner.run(correctParser);
    expect(defaultOutputBox.results.length).toBe(1);
    expect(defaultErrorBox.results.length).toBe(0);
  });
});
