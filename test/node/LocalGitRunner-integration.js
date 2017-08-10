// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('LocalGitRunner integration', function() {
  var execSync = require('child_process').execSync;

  var LocalGitRunner;
  var IDLFileContents;
  var GitilesIDLFile;
  var config;
  var gitilesBaseURL;
  var repositoryURL;
  var localRepositoryPath;
  var gitHash;

  var defaultErrorBox;
  var defaultOutputBox;
  var urlOutputBox;

  beforeAll(function() {
    localRepositoryPath = require('path').resolve(__dirname, '../data/git');
    repositoryURL = 'https://chromium.googlesource.com/chromium/src.git';
    gitilesBaseURL = 'https://chromium.googlesource.com/chromium/src/+';

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
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
    LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    defaultErrorBox = AccumulatorBox.create();
    defaultOutputBox = AccumulatorBox.create();
    urlOutputBox = AccumulatorBox.create();

    config = {
      description: 'Scrape IDL Files from Blink Repository',
      repositoryURL: repositoryURL,
      localRepositoryPath: localRepositoryPath,
      sparsePath: 'third_party/WebKit/Source',
      findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
      extension: 'idl',
      fileOutputBox: defaultOutputBox,
      urlOutputBox: urlOutputBox,
      errorBox: defaultErrorBox,
      freshRepo: false,            // Do not clear mock files and attempt fetch.
    };

    config.idlFileContentsFactory = function(path, contents, urls) {
      return IDLFileContents.create({
        metadata: GitilesIDLFile.create({
          repository: this.repositoryURL,
          gitilesBaseURL: gitilesBaseURL,
          revision: this.commit,
          path: path,
        }),
        contents: contents,
        specUrls: urls,
      });
    };
  });

  it('should stream mock included files', function(done) {
    // Increasing timeout for the purpose of this test.
    var origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 seconds.

    var localGitRunner = LocalGitRunner.create(config).run(false);
    var counter = 0;

    var interval = setInterval(function() {
      // We check every second for 10 seconds to see if the input
      // has arrived yet. On the 10th attempt (after 10 seconds),
      // we conclude the test has failed.
      if (urlOutputBox.results.length === 0 && counter < 10) {
        ++counter;
        return;
      }

      var expectedPaths = global.testGitRepoData.includePaths;
      var outputs = defaultOutputBox.results;
      expect(outputs.length).toBe(expectedPaths.length);
      expect(defaultErrorBox.results.length).toBe(0);

      // Expecting urlOutputBox to have 1 output.
      // Only files with URLs will send an output.
      expect(urlOutputBox.results.length).toBe(1);

      for (var i = 0; i < outputs.length; i++) {
        var file = outputs[i].idlFile;
        var actualPath = file.metadata.path;

        // Verify that properties were populated correctly.
        expect(expectedPaths.includes(actualPath)).toBe(true);
        expect(file.id[0]).toBe(repositoryURL);
        expect(file.id[1]).toBe(gitHash);
        expect(file.id[2]).toBe(actualPath);
      }
      clearInterval(interval);
      jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
      done();
    }, 1000);
  });

  it('should stream files to DAO if runner is created within context with outputDAO', function(done) {
    // Increasing timeout for the purpose of this test.
    var origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 seconds.
    var dao = foam.dao.MDAO.create({of: 'org.chromium.webidl.IDLFileContents'});
    var ctx = foam.createSubContext({outputDao: dao});

    var localGitRunner = LocalGitRunner.create(config, ctx).run(false);
    var counter = 0;

    var interval = setInterval(function() {
      if (defaultOutputBox.results.length === 0 && counter < 10) {
        ++counter;
        return;
      }

      dao.select().then(function(value) {
        expect(value.array).toBeDefined();

        var results = value.array;
        expect(results.length).toBeDefined();
        expect(results.length > 0).toBe(true);
        clearInterval(interval);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
        done();
      });
    });
  }, 1000);
});
