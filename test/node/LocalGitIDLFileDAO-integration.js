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
  var repositoryURL;
  var localRepositoryPath;
  var gitilesBaseURL;
  var gitHash;

  beforeAll(function() {
    repositoryURL = 'https://chromium.googlesource.com/chromium/src.git';
    localRepositoryPath =
        require('path').resolve(__dirname, '../data/git');

    var opts = {cwd: localRepositoryPath};
    execSync('/usr/bin/git init', opts);
    execSync('/usr/bin/git config user.email "test@example.com"', opts);
    execSync('/usr/bin/git config user.name "Tester"', opts);
    execSync('/usr/bin/git add .', opts);
    execSync('/usr/bin/git commit -m "Test commit"', opts);
    gitHash = execSync('/usr/bin/git rev-parse HEAD', opts).toString().trim();
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

  function daoFactory() {
    return StoreAndForwardDAO.create({
      of: IDLFileContents,
      delegate: LocalGitIDLFileDAO.create({
        repositoryURL: repositoryURL,
        sparsePath: 'third_party/WebKit/Source',
        localRepositoryPath: localRepositoryPath,
        findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
        idlFileContentsFactory: function(path, contents) {
          return IDLFileContents.create({
            metadata: IDLFile.create({
              repository: this.repositoryURL,
              revision: this.commit,
              path: path,
            }),
            contents: contents,
          });
        },
      }),
    });
  }

  it('should yield mock included files from select() when composed with store-and-forward DAO', function(done) {
    daoFactory().orderBy(IDLFileContents.ID).select().then(
        function(sink) {
          var actualFileContents = sink.a;
          var expectedPaths = global.testGitRepoData.includePaths;
          //expect(actualFileContents.length).toBe(expectedPaths.length);
          for (var i = 0; i < actualFileContents.length; i++) {
            var actualPath = actualFileContents[i].metadata.path;
            var expectedPath = expectedPaths[i];
            expect(actualPath).toBe(expectedPath);
          }
          done();
        }, done.fail);
  });

  it('should find() mock included files', function(done) {
    var dao = daoFactory();

    var expectedPaths = global.testGitRepoData.includePaths;
    Promise.all(global.testGitRepoData.includePaths.map(function(path) {
      return dao.find([repositoryURL, gitHash, path]);
    })).then(function(results) {
      for (var i = 0; i < results.length; i++) {
        expect(results[i]).not.toBeNull();
      }
      done();
    }, done.fail);
  });

  it('should reject put()', function(done) {
    daoFactory().put(IDLFile.create()).then(done.fail, done);
  });

  it('should reject remove()', function(done) {
    daoFactory().remove(IDLFile.create()).then(done.fail, done);
  });

  it('should reject removeAll()', function(done) {
    daoFactory().removeAll().then(done.fail, done);
  });
});
