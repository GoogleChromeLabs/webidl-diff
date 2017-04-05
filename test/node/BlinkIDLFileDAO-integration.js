// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BlinkIDLFileDAO integration', function() {
  var execSync = require('child_process').execSync;

  var IDLFileContents;
  var StoreAndForwardDAO;
  var BlinkIDLFileDAO;
  var localRepositoryPath;
  var includePaths;

  beforeAll(function() {
    localRepositoryPath =
        require('path').resolve(__dirname, '../data/blink/git');

    var opts = {cwd: localRepositoryPath};
    execSync('/usr/bin/git init', opts);
    execSync("/usr/bin/git add $(/usr/bin/find . | /bin/grep '[.]idl$')", opts);
    execSync('/usr/bin/git commit -m "Test commit"', opts);
  });

  beforeEach(function() {
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    StoreAndForwardDAO = foam.lookup('org.chromium.webidl.StoreAndForwardDAO');
    BlinkIDLFileDAO = foam.lookup('org.chromium.webidl.BlinkIDLFileDAO');
  });

  it('should yield mock included files from select() when composed with store-and-forward DAO', function(done) {
    StoreAndForwardDAO.create({
      of: IDLFileContents,
      delegate: BlinkIDLFileDAO.create({
        localRepositoryPath: localRepositoryPath,
      }),
    }).orderBy(IDLFileContents.ID).select().then(
        function(sink) {
          var actualFileContents = sink.a;
          var expectedPaths = global.testGitRepoData.blink.includePaths;
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
