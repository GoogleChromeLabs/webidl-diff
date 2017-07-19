// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractor-manual', function() {
  var HTMLFileContents;
  var IDLFragmentExtractor;
  var HTTPRequest;

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
    HTTPRequest = foam.lookup('foam.net.web.HTTPRequest');
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractor = foam.lookup('org.chromium.webidl.IDLFragmentExtractor');
  });

  describe('should parse the whatwg HTML standard', function() {
    var testDirectory = `${__dirname}/whatwg`;
    var expectedFragments = 178;

    // To be used for debugging purposes. Too much memory will be used
    // if this and raw is run together.
    it('Properly formatted', function() {
      cmpTest('whatwg HTML Standard (Properly formatted)', testDirectory, expectedFragments);
    });

    it('Raw', function() {
      cmpTest('whatwg HTML Standard (Raw)', testDirectory, expectedFragments, true);
    });
  });
});
