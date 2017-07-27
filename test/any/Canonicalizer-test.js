// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Canonicalizer', function() {
  var Canonicalizer;
  var IDLFile;
  var IDLFileContents;
  var Parser;

  beforeEach(function() {
    Canonicalizer = foam.lookup('org.chromium.webidl.Canonicalizer');
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    Parser = foam.lookup('org.chromium.webidl.Parser');
  });

  var parse = function(idl) {
    return Parser.create().parseString(idl, 'Test').value[0];
  }

  it('should return same number of files since we have different interfaces', function(done) {
    // Setting up files for canonicalization.
    var firstIdl = `interface FirstInterface { };`;
    var secondIdl = `partial interface SecondInterface { };`;

    var firstAst = parse(firstIdl);
    var secondAst = parse(secondIdl);

    // Callback function once Canonicalizer has finished processing.
    var onDone = function(results) {
      expect(Object.keys(results).length).toBe(2);
      done();
    };

    var canonicalizer = Canonicalizer.create({
      onDone: onDone,
      waitTime: 3, // Three seconds.
    });

    canonicalizer.addFragment(firstAst);
    canonicalizer.addFragment(secondAst);
  });

  it('should return canonicalized file for two fragments with same interface', function(done) {
    // Setting up files for canonicalization.
    var firstIdl = `
        [RaisesException=Constructor]
        interface SharedWorker : EventTarget {
        readonly attribute MessagePort incomingPort;
        readonly attribute MessagePort outgoingPort;
      };`;

    var secondIdl = `
      partial interface SharedWorker {
        [CallWith=ScriptState, Measure] readonly attribute DOMHighResTimeStamp workerStart;
      };`;

    var firstAst = parse(firstIdl);
    var secondAst = parse(secondIdl);

    var firstClone = firstAst.clone();
    var secondClone = secondAst.clone();

    // Callback function once Canonicalizer has finished processing.
    var onDone = function(results) {
      // Expecting one canonicalized file.
      expect(Object.keys(results).length).toBe(1);

      var sharedWorker = results['SharedWorker'];
      // Expecting the file to reference two sources.
      expect(sharedWorker.sources.length).toBe(2);
      // Expecting the definition to have 2 members and not be partial.
      expect(sharedWorker.definition.members.length).toBe(3);
      expect(sharedWorker.definition.isPartial).toBe(false);
      // Expecting decorators / attributes to be present.
      expect(sharedWorker.attrs.length).toBe(1);
      // Expecting inheritance to be present.
      expect(sharedWorker.definition.inheritsFrom).toBeDefined();

      // After merging, the original objects should remain untouched.
      expect(firstAst.definition.members.length)
          .toBe(firstClone.definition.members.length);
      expect(secondAst.definition.members.length)
          .toBe(secondClone.definition.members.length);
      expect(firstAst.attrs.length).toEqual(firstClone.attrs.length);
      expect(secondAst.attrs.length).toEqual(secondClone.attrs.length);
      expect(firstAst.definition.isPartial).toBe(false);
      expect(secondAst.definition.isPartial).toBe(true);

      done();
    };

    var canonicalizer = Canonicalizer.create({
      onDone: onDone,
      waitTime: 3, // Three seconds.
    });

    canonicalizer.addFragment(firstAst);
    canonicalizer.addFragment(secondAst);
  });

  it('should include Enum and Typedef while doing canonicalization', function(done) {
    // Setting up files for canonicalization.
    var firstIdl = `
      typedef (sequence<sequence<ByteString>> or record<ByteString, ByteString>) UnionWithRecord;
      partial interface SharedWorker {
        [CallWith=ScriptState, Measure] readonly attribute DOMHighResTimeStamp workerStart;
      };`;
    var secondIdl = `
      enum FoodEnum {
        "Bread",
        "Spaghetti",
        "Sushi"
      };

      interface SharedWorker : EventTarget {
        readonly attribute MessagePort port;
      };
      interface Test {
      };`;

    var firstAst = Parser.create().parseString(firstIdl, 'Test').value;
    var secondAst = Parser.create().parseString(secondIdl, 'Test').value;

    // Callback function once Canonicalizer has finished processing.
    var onDone = function(results) {
      // Expecting one canonicalized file.
      expect(Object.keys(results).length).toBe(4);
      // Expecting the file to reference two sources.
      expect(results['SharedWorker'].sources.length).toBe(2);
      // Expecting the definition to have 2 members.
      expect(results['SharedWorker'].definition.members.length).toBe(2);
      done();
    };

    var canonicalizer = Canonicalizer.create({
      onDone: onDone,
      waitTime: 3, // Three seconds.
    });

    firstAst.forEach(function(ast) {
      canonicalizer.addFragment(ast);
    });

    secondAst.forEach(function(ast) {
      canonicalizer.addFragment(ast);
    });
  });

  it('should throw error if two non-partial interfaces were given for same source', function() {
    console.error = jasmine.createSpy('error');
    console.log = jasmine.createSpy('log');

    // Setting up files for canonicalization.
    var idl = `
      interface SharedWorker {
        [CallWith=ScriptState, Measure] readonly attribute DOMHighResTimeStamp workerStart;
      };`;

    var ast = parse(idl);
    var canonicalizer = Canonicalizer.create({
      onDone: console.log,
      waitTime: 3, // Three seconds.
    });

    canonicalizer.addFragment(ast);
    expect(function() {
      canonicalizer.addFragment(ast);
    }).toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
