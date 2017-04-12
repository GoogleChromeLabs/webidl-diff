// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('WebKitParser', function() {
  var Parser;
  var WebKitParser;
  beforeEach(function() {
    Parser = foam.lookup('org.chromium.webidl.Parser');
    WebKitParser = foam.lookup('org.chromium.webidl.WebKitParser');
  });

  function parse(str, opt_production) {
    var p = WebKitParser.create().parseString(str, opt_production);
    expect(p.pos).toBe(str.length);
    return p;
  }

  it('should parser example fragment from Location interface', function() {
    var p = parse(
      'SetterCallWith=ActiveWindow&FirstWindow',
      'ExtendedAttributeLogicalOperators');
    expect(p.value).toBeDefined();
    expect(p.value.name.literal).toBe('SetterCallWith');
    expect(p.value.args.length).toBe(2);
    expect(p.value.args[0].literal).toBe('ActiveWindow');
    expect(p.value.args[1].literal).toBe('FirstWindow');
  });
  it('should parse example interface from Location interface', function() {
    var p = parse(`
        interface Location {
          [SetterCallWith=ActiveWindow&FirstWindow, DoNotCheckSecurityOnSetter] stringifier attribute USVString href;
        };
    `);
    expect(p.value).toBeDefined();
  });
  it('should skip C-style preprocessor directives', function() {
    var p = parse(`
        #ifndef FOO
        interface Location {
          #if BAR
          [SetterCallWith=ActiveWindow&FirstWindow, DoNotCheckSecurityOnSetter]
          #endif
          stringifier attribute USVString href;
        };
        #endif
    `);
    expect(p.value).toBeDefined();
  });
});
