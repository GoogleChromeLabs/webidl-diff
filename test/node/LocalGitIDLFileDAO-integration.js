// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('LocalGitIDLFileDAO integration', function() {
  var execSync = require('child_process').execSync;

  var IDLFile;
  var IDLFileContents;
  var StoreAndForwardDAO;
  var LocalGitIDLFileDAO;
  var localRepositoryPath;
  var gitilesBaseURL;

  beforeAll(function() {
    localRepositoryPath =
        require('path').resolve(__dirname, '../data/git');

    var opts = {cwd: localRepositoryPath};
    execSync('/usr/bin/git init', opts);
    execSync('/usr/bin/git config user.email "test@example.com"', opts);
    execSync('/usr/bin/git config user.name "Tester"', opts);
    execSync('/usr/bin/git add .', opts);
    execSync('/usr/bin/git commit -m "Test commit"', opts);
  });

  afterAll(function() {
    var opts = {cwd: localRepositoryPath};
    execSync(`/bin/rm -rf "${localRepositoryPath}/.git"`, opts);
  });

  beforeEach(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    StoreAndForwardDAO = foam.lookup('org.chromium.webidl.StoreAndForwardDAO');
    LocalGitIDLFileDAO = foam.lookup('org.chromium.webidl.LocalGitIDLFileDAO');
  });

  it('should yield mock included files from select() when composed with store-and-forward DAO', function(done) {
    StoreAndForwardDAO.create({
      of: IDLFileContents,
      delegate: LocalGitIDLFileDAO.create({
        repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
        sparsePath: 'third_party/WebKit/Source',
        localRepositoryPath: localRepositoryPath,
        findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
        idlFileContentsFactory: function(path, contents) {
          return IDLFileContents.create({
            metadata: IDLFile.create({
              repository: this.respositoryURL,
              revision: this.commit,
              path: path,
            }),
            contents: contents,
          });
        },
      }),
    }).orderBy(IDLFileContents.ID).select().then(
        function(sink) {
          var actualFileContents = sink.a;
          var expectedPaths = global.testGitRepoData.includePaths;
          expect(actualFileContents.length).toBe(expectedPaths.length);
          for (var i = 0; i < actualFileContents.length; i++) {
            var actualPath = actualFileContents[i].metadata.path;
            var expectedPath = expectedPaths[i];
            expect(actualPath).toBe(expectedPath);
          }
          done();
        }, done.fail);
  });
});
