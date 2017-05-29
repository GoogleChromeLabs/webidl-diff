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
    </pre>`;
    var ret = HTMLParser.create().parse(content);
  });

  it('should parse the WebUSB spec HTML file ', function() {
    var fs = require('fs');
    var testDirectory = `${__dirname}/webSpec/WebUSB`;
    var spec = fs.readFileSync(`${testDirectory}/spec.html`).toString();
    var idlFragments = HTMLParser.create().parse(spec);

    expect(idlFragments.length).toBe(15);
    fs.readdir(testDirectory, function(err, files) {
      // Go through each of the expected results in the folder
      files.forEach(function(filename) {
        var testNum = Number(filename);

        if (!isNaN(testNum) && testNum < idlFragments.length) {
          var expectedIDL = fs.readFileSync(`${testDirectory}/${filename}`).toString();
          expect(idlFragments[testNum].idl).toBe(expectedIDL);
        } else if (filename !== 'spec.html') {
          console.warn(`${filename} was not used in WebUSB spec test`);
        }
      });
    });
  });
});
