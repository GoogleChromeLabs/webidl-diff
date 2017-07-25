// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.parseIDLFileTest = function(data) {
  describe(data.description, function() {
    var execSync = require('child_process').execSync;
    var originalTimeout;
    var LocalGitRunner;
    var outputBox;
    var errorBox;

    afterAll(function() {
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
      data.Parser = foam.lookup(`org.chromium.webidl.${data.parser}`);
      data.IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');

      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

      // Must not be in place before each test (including first).
      execSync(`/bin/rm -rf ${data.localRepositoryPath}`);
    });

    it('should fetch git repo and produce valid parse trees', function(done) {
      var onDone = function() {
        expect(outputBox.results.length > 0).toBe(true);
        expect(errorBox.results.length).toBe(0);

        var results = outputBox.results.map(function(result) {
          return result.idlFile;
        });
        var parser = data.Parser.create();

        results.forEach(function(result) {
          var idl = result.contents;
          var parse = parser.parseString(idl);
          expect(parse.pos).toBe(idl.length);
          expect(parse.value).toBeDefined();
        });
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
