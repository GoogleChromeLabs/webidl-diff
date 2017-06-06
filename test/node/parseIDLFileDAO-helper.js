// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.parseIDLFileDAOTest = function(data) {
  describe(data.description, function() {
    var execSync = require('child_process').execSync;
    var originalTimeout;

    afterAll(function() {
      execSync(`/bin/rm -rf "${data.localRepositoryPath}"`);
    });

    beforeEach(function() {
      data.GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
      data.GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
      data.Parser = foam.lookup(`org.chromium.webidl.${data.parser}`);
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

    it('should fetch git repo and produce valid parse trees', function(done) {
      data.StoreAndForwardDAO.create({
        of: data.IDLFileContents,
        delegate: data.LocalGitIDLFileDAO.create({
          repositoryURL: data.repositoryURL,
          sparsePath: data.sparsePath,
          localRepositoryPath: data.localRepositoryPath,
          findExcludePatterns: data.findExcludePatterns,
          idlFileContentsFactory: data.idlFileContentsFactory,
          extension: data.extension,
        })
      }).select().then(
          function(sink) {
            var results = sink.array;
            expect(results.length).toBeGreaterThan(0);

            var parser = data.Parser.create();

            results.forEach(function(result) {
              var idl = result.contents;
              var p = parser.parseString(idl);
              expect(p.pos).toBe(idl.length);
              expect(p.value).toBeDefined();
            });
            done();
          }, done.fail)
      .catch(done.fail);
    });
  });
};
