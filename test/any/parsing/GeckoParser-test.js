// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('GeckoParser', function() {
  var Parser;
  var GeckoParser;
  beforeEach(function() {
    Parser = foam.lookup('org.chromium.webidl.Parser');
    GeckoParser = foam.lookup('org.chromium.webidl.GeckoParser');
  });

  function parse(str, opt_production) {
    var p = GeckoParser.create().parseString(str, opt_production);
    expect(p.pos).toBe(str.length);
    return p;
  }

  it('should parse interface forward declaration as null', function() {
    var p = parse('interface Frobinator;', 'InterfaceFwdDecl');
    expect(p.value).toBeNull();
  });
  it('should parse "jsonifier;" as null', function() {
    var p = parse('jsonifier;', 'Jsonifier');
    expect(p.value).toBeNull();
  });
  it('should skip C-style preprocessor directives', function() {
    var p = parse(`
        #ifndef FOO
        interface Location {
          #if BAR
          [SomeCustomExtendedAttribute]
          #endif
          stringifier attribute USVString href;

          jsonifier;
        };
        #endif
    `);
    expect(p.value).toBeDefined();
  });
  it('should report parse complete status to console', function() {
    console.info = jasmine.createSpy();
    var p = GeckoParser.create().logParse('interface Frobinator;', 'InterfaceFwdDecl');
    expect(console.info).toHaveBeenCalledWith('Parse complete');
  });
  it('should report parse incomplete status to console', function() {
    console.warn = jasmine.createSpy();
    var p = GeckoParser.create().logParse('interface', 'InterfaceFwdDecl');
    expect(console.warn).toHaveBeenCalledWith('Parse incomplete');
  });
});
