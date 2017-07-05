// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractor', function() {
  var HTMLFileContents;
  var IDLFragmentExtractor;
  var Parser;

  function cmpTest(testName, testDirectory, numExpectedIDLFragments, raw) {
    var fs = require('fs');
    var dir = `${testDirectory}/${raw ? 'spec-raw' : 'spec'}.html`;
    var spec = fs.readFileSync(dir).toString();
    var htmlFile = HTMLFileContents.create({
      url: dir, // Setting URL to dir for testing purposes only.
      timestamp: new Date(),
      contents: spec,
    });

    var extractor = IDLFragmentExtractor.create({file: htmlFile});
    var idlFragments = extractor.idlFragments;

    // Determine the number of fragments that were found.
    expect(idlFragments.length).toBe(numExpectedIDLFragments);

    fs.readdir(testDirectory, function(err, files) {
      // Go through each of the expected results in the folder.
      files.forEach(function(filename) {
        var testNum = Number(filename);

        if (!isNaN(testNum) && testNum < idlFragments.length) {
          var path = `${testDirectory}/${filename}`;
          var expectedContent = fs.readFileSync(path).toString();
          expect(idlFragments[testNum].trim()).toBe(expectedContent.trim());
        } else if (filename !== 'spec.html' && filename !== 'spec-raw.html') {
          fail(`File ${filename} was not used in ${testName} spec test`);
        }
      });
    });
  }

  beforeEach(function() {
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractor = foam.lookup('org.chromium.webidl.IDLFragmentExtractor');
  });

  it('should parse a pre tag with no content', function() {
    var contents = '<pre class="idl"></pre>';
    var htmlFile = HTMLFileContents.create({
      url: 'http://basicTest.url',
      timestamp: new Date(),
      contents: contents,
    });
    var extractor = IDLFragmentExtractor.create({file: htmlFile});
    expect(extractor).toBeDefined();
    expect(extractor.idlFragments.length).toBe(1);
  });

  it('should parse a pre tag with multiple attributes', function() {
    var contents = '<pre class="text potato" class="idl"></pre>';
    var htmlFile = HTMLFileContents.create({
      url: 'http://basicTest.url',
      timestamp: new Date(),
      contents: contents,
    });
    var extractor = IDLFragmentExtractor.create({file: htmlFile});
    expect(extractor).toBeDefined();
    expect(extractor.idlFragments.length).toBe(1);
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
    var contents = `<pre class="idl">${idl}</pre>`;
    var htmlFile = HTMLFileContents.create({
      url: 'http://something.url',
      timestamp: new Date(),
      contents: contents,
    });
    var extractor = IDLFragmentExtractor.create({file: htmlFile});
    expect(extractor).toBeDefined();
    expect(extractor.idlFragments.length).toBe(1);
    expect(extractor.idlFragments[0]).toBe(idl);
  });

  it('should parse a HTML file with nested excludes', function() {
    var firstIDL = `
      interface Potato {
        attribute unsigned long weight;
      };`;
    var secondIDL = `
      interface Tomato {
        attribute unsigned long weight;
      };`;
    var contents = `
      <html>
        <div class="example">
          <div class="note">Something here</div>
          <div class="example">
            <pre class="idl">${firstIDL}</pre>
          </div>
        </div>
        <pre class="idl">${secondIDL}</pre>
      </html>`;
    var htmlFile = HTMLFileContents.create({
      url: 'http://something.url',
      timestamp: new Date(),
      contents: contents,
    });
    var extractor = IDLFragmentExtractor.create({file: htmlFile});
    expect(extractor).toBeDefined();
    expect(extractor.idlFragments.length).toBe(1);
    expect(extractor.idlFragments[0]).toBe(secondIDL);
  });

  describe('should parse the UI Events spec HTML file (w3c)', function() {
    var testDirectory = `${__dirname}/UIEvent`;
    var expectedFragments = 18;
    it('Properly Formatted', function() {
      cmpTest('UI Events (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('UI Events (Raw)', testDirectory, expectedFragments, true);
    });
  });

  describe('should parse the WebGL spec HTML file (khronos)', function() {
    var testDirectory = `${__dirname}/WebGL`;
    var expectedFragments = 7;

    it('Properly Formatted', function() {
      cmpTest('WebGL (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('WebGL (Raw)', testDirectory, expectedFragments, true);
    });
  });

  describe('should parse the Embedded Content spec (wicg)', function() {
    var testDirectory = `${__dirname}/EmbeddedContent`;
    var expectedFragments = 21;
    it('Properly Formatted', function() {
      cmpTest('Embedded Content (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('Embedded Content (Raw)', testDirectory, expectedFragments, true);
    });
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

  describe('should parse the Console standard HTML (whatwg)', function() {
    var testDirectory = `${__dirname}/Console`;
    var expectedFragments = 2;
    it('Properly Formatted', function() {
      cmpTest('Console (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('Console (Raw)', testDirectory, expectedFragments, true);
    });
  });

  describe('should parse the whatwg HTML standard', function() {
    var testDirectory = `${__dirname}/whatwg`;
    var expectedFragments = 178;
    it('Properly formatted', function() {
      cmpTest('whatwg HTML Standard (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('whatwg HTML Standard (Raw)', testDirectory, expectedFragments, true);
    });
  });
});
