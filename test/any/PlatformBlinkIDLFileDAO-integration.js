// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('PlatformBlinkIDLFileDAO', function() {
  var Count;
  var GitilesIDLFile;
  var StoreAndForwardDAO;
  var PlatformBlinkIDLFileDAO;
  var BlinkIDLFileDAO;
  var baseDAO;
  var platformDAO;
  var baseCount;
  var platformCount;
  var baseResults;
  var platformResults;

  // NOTE: Tests in this file must not be FOAM context-sensitive because shared
  // test data are created once in beforeAll(), and each test will run in its
  // own test context.
  beforeAll(function() {
    GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
    StoreAndForwardDAO = foam.lookup('org.chromium.webidl.StoreAndForwardDAO');
    BlinkIDLFileDAO = foam.lookup('org.chromium.webidl.BlinkIDLFileDAO');
    PlatformBlinkIDLFileDAO =
        foam.lookup('org.chromium.webidl.PlatformBlinkIDLFileDAO');
    Count = foam.lookup('foam.mlang.sink.Count');

    baseDAO = StoreAndForwardDAO.create({
      of: GitilesIDLFile,
      delegate: BlinkIDLFileDAO.create({of: GitilesIDLFile}),
    });
    platformDAO = PlatformBlinkIDLFileDAO.create({
      of: GitilesIDLFile,
      delegate: baseDAO,
    });
    baseCount = baseDAO.select(Count.create());
    platformCount = platformDAO.select(Count.create());
    baseResults = baseDAO.select();
    platformResults = platformDAO.select();
  });

  it('should not contain mojo files', function(done) {
    platformResults.then(function(sink) {
      var array = sink.a;
      for (var i = 0; i < array.length; i++) {
        expect(array[i].path).not.toContain('/mojo/');
      }
      done();
    });
  });
  it('should not contain test files', function(done) {
    platformResults.then(function(sink) {
      var array = sink.a;
      for (var i = 0; i < array.length; i++) {
        expect(array[i].path).not.toContain('/testing/');
        expect(array[i].path).not.toContain('/tests/');
      }
      done();
    });
  });
  it('should yield a bunch of IDL files', function(done) {
    platformCount.then(function(sink) {
      expect(sink.value).toBeGreaterThan(0);
      done();
    });
  });
  it('should yield fewer files than complete IDL file list', function(done) {
    Promise.all([baseCount, platformCount]).then(function(array) {
      var baseCountValue = array[0].value;
      var platformCountValue = array[1].value;
      expect(baseCountValue).toBeGreaterThan(platformCountValue);
      done();
    });
  });
});
