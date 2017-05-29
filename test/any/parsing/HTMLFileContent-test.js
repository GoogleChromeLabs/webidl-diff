// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('HTMLFileContent', function() {
  var HTMLParser;
  //var Outputer;
  var Parser;

  beforeEach(function() {
    HTMLParser = foam.lookup('org.chromium.webidl.HTMLParser');
  });

  it('should parse a pre tag with no content', function() {
    var content = '<pre class="idl"></pre>';
  });

  it('should parse a HTML file with one Web IDL Block', function() {
    var content = `
        <pre class="idl">
          [Constructor]
          interface Dahut : Mammal {
            const unsigned short LEVROGYROUS = 0;
            const unsigned short DEXTROGYROUS = 1;
            readonly attribute DOMString chirality;
            attribute unsigned long age;
            Dahut turnAround(float angle, boolean fall);
            unsigned long trip();
            void yell([AllowAny] unsigned long volume,
                      [TreatNullAs=EmptyString] DOMString sentence);
          };
      </pre>
    `;
    var ret = HTMLParser.create().parseString(content);
  });
});
