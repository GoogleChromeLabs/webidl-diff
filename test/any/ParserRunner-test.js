// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Parser Runner', function() {
  var IDLFile;
  var IDLFileContents;
  var Parser;
  var ParserRunner;

  var outputBox;
  var errorBox;

  beforeEach(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    Parser = foam.lookup('org.chromium.webidl.Parser');
    ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    outputBox = AccumulatorBox.create();
    errorBox = AccumulatorBox.create();
  });

  function createRunner(opt_parser) {
    opt_parser = opt_parser || Parser;
    return ParserRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
      parserType: opt_parser,
    });
  }

  it('should send an error if invalid arguments are received as message', function() {
    var wrongObj = {};
    var runner = createRunner();
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);
  });

  it('should send an error to errorBox if parsing with incorrect parser', function() {
    // Test details: An IDL file with preprocessor directives will be used. The
    // Blink parser is not capable of parsing preprocessor directives and the
    // test is expected to fail if the correct parser is injected.

    var idlFile = IDLFileContents.create({
      metadata: IDLFile.create({
        repository: 'Test',
        revision: '0',
        path: 'someFile',
      }),
      contents: `
        #define FOO 42
        interface Location {
          stringifier attribute USVString href;
        };`,
    });

    var runner = createRunner();

    // Expect parsing with the wrong parser to fail.
    runner.run(idlFile);
    expect(outputBox.results.length).toBe(0);
    expect(errorBox.results.length).toBe(1);
  });

  it('should parse file with the correct parser and return message with results', function() {
    // Test details: An IDL file with preprocessor directives will be used. The
    // WebKit parser is capable of parsing preprocessor directives and the test
    // is expected to succeed if the correct parser is injected.

    var idlFile = IDLFileContents.create({
      metadata: IDLFile.create({
        repository: 'Test',
        revision: '0',
        path: 'someFile',
      }),
      contents: `
        #define FOO 42
        interface Location {
          stringifier attribute USVString href;
        };`,
    });

    var WebKitParser = foam.lookup('org.chromium.webidl.WebKitParser');
    var runner = createRunner(WebKitParser);

    // Expect parsing with the right parser to yield results.
    runner.run(idlFile);
    expect(outputBox.results.length).toBe(1);
    expect(errorBox.results.length).toBe(0);
  });
});
