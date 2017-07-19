// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractor-manual', function() {
  var HTMLFileContents;
  var IDLFragmentExtractor;
  var cmpTest;

  beforeEach(function() {
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractor = foam.lookup('org.chromium.webidl.IDLFragmentExtractor');
    cmpTest = global.idlFragmentExtractorTest.bind(this,
      HTMLFileContents, IDLFragmentExtractor);
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
