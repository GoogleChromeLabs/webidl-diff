// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.manualLocalGitTest = function(data) {
  describe(data.description, function() {
    var execSync = require('child_process').execSync;
    var originalTimeout;
    var LocalGitRunner;
    var outputBox;
    var errorBox;

    afterAll(function() {
      // Must not be in place after tests complete.
      execSync(`/bin/rm -rf "${data.localRepositoryPath}"`);
    });

    beforeEach(function() {
      global.defineAccumulatorBox();

      LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
      var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
      outputBox = AccumulatorBox.create();
      errorBox = AccumulatorBox.create();

      data.GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
      data.GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
      data.IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');

      // Creating temporary directory for repo files.
      // execSync returns a Buffer with a new line character.
      data.localRepositoryPath = execSync('mktemp -d').toString().trim(-1);

      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    });

    it('should fetch git repo and send files to outputBox', function(done) {
      var onDone = function() {
        expect(outputBox.results.length > 0).toBe(true);
        expect(errorBox.results.length).toBe(0);
        done();
      }.bind(this);

      LocalGitRunner.create({
        repositoryURL: data.repositoryURL,
        sparsePath: data.sparsePath,
        localRepositoryPath: data.localRepositoryPath,
        findExcludePatterns: data.findExcludePatterns,
        idlFileContentsFactory: data.idlFileContentsFactory,
        extension: data.extension,
        fileOutputBox: outputBox,
        errorBox: errorBox,
        onDone: onDone,
      }).run();
    });
  });
};
