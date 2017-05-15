// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Comparing parses', function() {
  var Outputer;
  var Parser;

  // TODO(markdittmer): Use FOAM ClassLoader instead after
  // https://github.com/foam-framework/foam2/issues/262 is resolved.
  beforeEach(function() {
    Parser = foam.lookup('org.chromium.webidl.Parser');
    Outputer = foam.lookup('org.chromium.webidl.Outputer');
  });
  // beforeEach(function(done) {
  //   var X = foam.__context__;
  //   Promise.all([
  //     X.arequire('org.chromium.webidl.Parser')
  //         .then(function(P) { Parser = P; }),
  //     X.arequire('org.chromium.webidl.Outputer')
  //         .then(function(O) { Outputer = O; })
  //   ]).then(function() { done(); });
  // });

  function cmpTest(input, name) {
    var firstParse = Parser.create().parseString(input);

    expect(firstParse.pos).toBe(input.length);

    var firstParseValue = firstParse.value;
    var outputer = Outputer.create();

    for (var i = 0; i < firstParseValue.length; i++) {
      var firstFragment = firstParseValue[i];
      var stringified = outputer.stringify(firstFragment);
      var secondParseValue = Parser.create().parseString(stringified).value;
      var secondFragment = secondParseValue[0];
      expect(
        foam.util.compare(firstFragment, secondFragment),
        'parse(' + name + ')[' + i + '] == parse(stringify(parse(' + name +
          ')[' + i + ']))'
      );
    }
  }

  it(
    'parse(spec) == parse(stringify(parse(spec)))',
    cmpTest.bind(this, global.some_spec_idl, 'spec')
  );

  it(
    'parse(spec) == parse(stringify(parse(spec)))',
    cmpTest.bind(this, global.additional_idl_spec, 'additional_idl_spec')
  );

  it(
    'parse(blink) == parse(stringify(parse(blink)))',
    cmpTest.bind(this, global.all_blink_idl, 'blink')
  );
});
