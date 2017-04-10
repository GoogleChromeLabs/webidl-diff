// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.manualLocalGitTest = function(data) {
  describe(data.description, function() {
    var execSync = require('child_process').execSync;
    var originalTimeout;

    afterAll(function() {
      // Must not be in place after tests complete.
      execSync(`/bin/rm -rf "${data.localRepositoryPath}"`);
    });

    beforeEach(function() {
      data.GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
      data.GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
      data.IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
      data.StoreAndForwardDAO =
          foam.lookup('org.chromium.webidl.StoreAndForwardDAO');
      data.LocalGitIDLFileDAO =
        foam.lookup('org.chromium.webidl.LocalGitIDLFileDAO');

      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

      // Must not be in place before each test (including first).
      execSync(`/bin/rm -rf ${data.localRepositoryPath}`);
    });

    it('should fetch git repo and yield files on select()', function(done) {
      data.StoreAndForwardDAO.create({
        of: data.IDLFileContents,
        delegate: data.LocalGitIDLFileDAO.create({
          repositoryURL: data.repositoryURL,
          sparsePath: data.sparsePath,
          localRepositoryPath: data.localRepositoryPath,
          findExcludePatterns: data.findExcludePatterns,
          idlFileContentsFactory: data.idlFileContentsFactory,
        }),
      }).select(foam.lookup('foam.mlang.sink.Count').create()).then(
        function(sink) {
          console.log(sink.value, 'IDL files found');
          expect(sink.value).toBeGreaterThan(0);
          done();
        }, done.fail);
    });
  });
};
