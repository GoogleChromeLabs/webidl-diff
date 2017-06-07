// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('HTMLFileContent', function() {
  var HTMLFileContent;
  var Parser;

  function cmpTest(testName, testDirectory, expectedIDL) {
    var fs = require('fs');
    var spec = fs.readFileSync(`${testDirectory}/spec.html`).toString();
    var htmlSpec = HTMLFileContent.create({ file: spec });
    var idlFragments = htmlSpec.idlFragments;

    // Determine the number of fragments that were found.
    expect(idlFragments.length).toBe(expectedIDL);

    fs.readdir(testDirectory, function(err, files) {
      // Go through each of the expected results in the folder.
      files.forEach(function(filename) {
        var testNum = Number(filename);

        if (!isNaN(testNum) && testNum < idlFragments.length) {
          var expectedContent = fs.readFileSync(`${testDirectory}/${filename}`).toString();
          expect(idlFragments[testNum].trim()).toBe(expectedContent.trim());
        } else if (filename !== 'spec.html') {
          fail(`File ${filename} was not used in ${testName} spec test`);
        }
      });
    });
  }

  beforeEach(function() {
    HTMLFileContent = foam.lookup('org.chromium.webidl.HTMLFileContent');
  });

  it('should parse a pre tag with no content', function() {
    var content = '<pre class="idl"></pre>';
    var htmlFile = HTMLFileContent.create({ file: content });
    expect(htmlFile).toBeDefined();
    expect(htmlFile.idlFragments.length).toBe(1);
  });

  it('should parse a HTML file with one Web IDL Block', function() {
    var idl = `[Constructor]
      interface Dahut : Mammal {
        const unsigned short LEVROGYROUS = 0;
        const unsigned short DEXTROGYROUS = 1;
        readonly attribute DOMString chirality;
        attribute unsigned long age;
        Dahut turnAround(float angle, boolean fall);
        unsigned long trip();
        void yell([AllowAny] unsigned long volume,
          [TreatNullAs=EmptyString] DOMString sentence);
    };`;
    var content = `<pre class="idl">${idl}</pre>`;
    var htmlFile = HTMLFileContent.create({ file: content });
    expect(htmlFile).toBeDefined();
    expect(htmlFile.idlFragments.length).toBe(1);
    expect(htmlFile.idlFragments[0]).toBe(idl);
  });

  it('should parse the UI Events spec HTML file (w3c)', function() {
    var testDirectory = `${__dirname}/UIEvent`;
    var expectedFragments = 18;
    cmpTest('UI Events', testDirectory, expectedFragments);
  });

  it('should parse the WebGL spec HTML file (khronos)', function() {
    var testDirectory = `${__dirname}/WebGL`;
    var expectedFragments = 7;
    cmpTest('WebGL', testDirectory, expectedFragments);
  });

  it('should parse the WebUSB spec HTML file (wicg)', function() {
    var testDirectory = `${__dirname}/WebUSB`;
    var expectedFragments = 11;
    cmpTest('WebUSB', testDirectory, expectedFragments);
  });

  it('should parse the XMLHttpRequest spec HTML file (whatwg)', function() {
    var testDirectory = `${__dirname}/XMLHttpRequest`;
    var expectedFragments = 4;
    cmpTest('XMLHttpRequest', testDirectory, expectedFragments);
  });

  it('should parse the whatwg HTML standard', function() {
    var testDirectory = `${__dirname}/whatwg`;
    var expectedFragments = 45;
    cmpTest('whatwg HTML', testDirectory, expectedFragments);
  });
});
