// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractor', function() {
  var HTMLFileContents;
  var IDLFragmentExtractor;
  var cmpTest;

  beforeEach(function() {
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractor = foam.lookup('org.chromium.webidl.IDLFragmentExtractor');
    cmpTest = global.idlFragmentExtractorTest.bind(this,
      HTMLFileContents, IDLFragmentExtractor);
  });

  it('should parse a pre tag with no content', function() {
    var contents = '<pre class="idl"></pre>';
    var htmlFile = HTMLFileContents.create({
      url: 'http://basicTest.url',
      timestamp: new Date(),
      contents: contents,
    });
    var results = IDLFragmentExtractor.create().extract(htmlFile);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
  });

  it('should parse a pre tag with multiple attributes', function() {
    var contents = '<pre class="text potato" class="idl"></pre>';
    var htmlFile = HTMLFileContents.create({
      url: 'http://basicTest.url',
      timestamp: new Date(),
      contents: contents,
    });
    var results = IDLFragmentExtractor.create().extract(htmlFile);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
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
    var results = IDLFragmentExtractor.create().extract(htmlFile);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0]).toBe(idl);
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
    var results = IDLFragmentExtractor.create().extract(htmlFile);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0]).toBe(secondIDL);
  });

  describe('should parse the UI Events spec HTML file (w3c)', function() {
    var testDirectory = `${__dirname}/UIEvent`;
    var expectedFragments = 17;
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
    var expectedFragments = 10;
    cmpTest('WebUSB', testDirectory, expectedFragments);
  });

  it('should parse the XMLHttpRequest spec HTML file (whatwg)', function() {
    var testDirectory = `${__dirname}/XMLHttpRequest`;
    var expectedFragments = 3;
    cmpTest('XMLHttpRequest', testDirectory, expectedFragments);
  });

  describe('should parse the Console standard HTML (whatwg)', function() {
    var testDirectory = `${__dirname}/Console`;
    var expectedFragments = 1;
    it('Properly Formatted', function() {
      cmpTest('Console (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('Console (Raw)', testDirectory, expectedFragments, true);
    });
  });
});
