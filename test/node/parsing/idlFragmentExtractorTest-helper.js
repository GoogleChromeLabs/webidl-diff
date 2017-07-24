// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.idlFragmentExtractorTest =
  function(HTMLFileContents, IDLFragmentExtractor,
      testName, testDirectory, numExpectedIDLFragments, raw) {
    var fs = require('fs');
    var dir = `${testDirectory}/${raw ? 'spec-raw' : 'spec'}.html`;
    var spec = fs.readFileSync(dir).toString();
    var htmlFile = HTMLFileContents.create({
      url: dir, // Setting URL to dir for testing purposes only.
      timestamp: new Date(),
      contents: spec,
    });

    var extractor = IDLFragmentExtractor.create();
    var idlFragments = extractor.extract(htmlFile);

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
  };
