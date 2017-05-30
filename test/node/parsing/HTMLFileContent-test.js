// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('HTMLFileContent', function() {
  var HTMLFileContent;
  var Parser;

  function cmpTest(testName, testDirectory, expectedPre, expectedIDL) {
    var fs = require('fs');
    var spec = fs.readFileSync(`${testDirectory}/spec.html`).toString();
    var htmlSpec = HTMLFileContent.create({ file: spec });
    var preBlocks = htmlSpec.pre;
    var idlFragments = preBlocks.filter(function(block) {
      return block.isIDL;
    });

    // Determine the number of fragments that were found
    expect(preBlocks.length).toBe(expectedPre)
    expect(idlFragments.length).toBe(expectedIDL);

    fs.readdir(testDirectory, function(err, files) {
      // Go through each of the expected results in the folder
      files.forEach(function(filename) {
        var testNum = Number(filename);

        if (!isNaN(testNum) && testNum < preBlocks.length) {
          var expectedContent = fs.readFileSync(`${testDirectory}/${filename}`).toString();
          expect(preBlocks[testNum].content.trim()).toBe(expectedContent.trim());
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
    expect(htmlFile.pre.length).toBe(1);
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
    expect(htmlFile.pre.length).toBe(1);
    expect(htmlFile.pre[0].content).toBe(idl);
  });

  it('should parse the UI Events spec HTML file', function() {
    var testDirectory = `${__dirname}/UIEvent`;
    var expectedFragments = 27;
    var expectedIDLFrags = 18;
    cmpTest('UI Events', testDirectory, expectedFragments, expectedIDLFrags);
  });

  it('should parse the WebUSB spec HTML file ', function() {
    var testDirectory = `${__dirname}/WebUSB`;
    var expectedFragments = 12;
    var expectedIDLFrags = 11;
    cmpTest('WebUSB', testDirectory, expectedFragments, expectedIDLFrags);
  });

  it('should parse the whatwg HTML standard', function() {
    var testDirectory = `${__dirname}/whatwg`;
    var expectedFragments = 155;
    var expectedIDLFrags = 45;
    cmpTest('whatwg HTML', testDirectory, expectedFragments, expectedIDLFrags);
  });
});
