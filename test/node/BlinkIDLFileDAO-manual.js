// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BlinkIDLFileDAO manual', function() {
  var execSync = require('child_process').execSync;

  var IDLFileContents;
  var StoreAndForwardDAO;
  var BlinkIDLFileDAO;
  var localRepositoryPath;
  var includePaths;
  var originalTimeout;

  beforeAll(function() {
    localRepositoryPath =
        require('path').resolve(__dirname, '../data/blink/manual_git');
  });

  beforeEach(function() {
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    StoreAndForwardDAO = foam.lookup('org.chromium.webidl.StoreAndForwardDAO');
    BlinkIDLFileDAO = foam.lookup('org.chromium.webidl.BlinkIDLFileDAO');

    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
  });

  afterEach(function() {
    execSync(`/bin/rm -rf ${localRepositoryPath}`);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should fetch git repo and yield files on select()', function(done) {
    StoreAndForwardDAO.create({
      of: IDLFileContents,
      delegate: BlinkIDLFileDAO.create({
        localRepositoryPath: localRepositoryPath,
      }),
    }).select(foam.lookup('foam.mlang.sink.Count').create()).then(
        function(sink) {
          expect(sink.value).toBeGreaterThan(0);
          done();
        }, done.fail);
  });
});
