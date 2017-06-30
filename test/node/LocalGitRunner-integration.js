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
    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'AccumulatorBox',
      implements: [ 'foam.box.Box' ],

      properties: [
        {
          class: 'Array',
          name: 'outputs',
        },
      ],

      methods: [
        function send(message) {
          this.outputs.push(message.object);
        },
        function clear() { this.outputs = []; }
      ]
    });
    var AccumulatorBox = foam.lookup('foam.box.pipeline.test.AccumulatorBox');
    defaultErrorBox = AccumulatorBox.create();
    defaultOutputBox = AccumulatorBox.create();
    urlOutputBox = AccumulatorBox.create();

    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
    LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');

    config = {
      description: 'Scrape IDL Files from Blink Repository',
      repositoryURL: repositoryURL,
      localRepositoryPath: localRepositoryPath,
      sparsePath: 'third_party/WebKit/Source',
      findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
      extension: 'idl',
      parser: 'Parser', // Default IDL Parser used for Blink.
      urlOutputBox: urlOutputBox,
      errorBox: defaultErrorBox,   // Not normally provided during pipelining.
      outputBox: defaultOutputBox, // Not normally provided during pipelining.
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
    var localGitRunner = LocalGitRunner.create(config).run(false);

    setTimeout(function() {
      var expectedPaths = global.testGitRepoData.includePaths;
      var outputs = defaultOutputBox.outputs;
      expect(outputs.length).toBe(expectedPaths.length);
      expect(defaultErrorBox.outputs.length).toBe(0);

      // Expecting urlOutputBox to always have 1 output as it
      // is only called once all files processed. Length of URL
      // list may differ though.
      expect(urlOutputBox.outputs.length).toBe(1);

      for (var i = 0; i < outputs.length; i++) {
        var file = outputs[i].file;
        var actualPath = file.metadata.path;
        var expectedPath = expectedPaths[i];

        // Verify that properties were populated correctly
        expect(expectedPath.includes(actualPath)).toBe(true);
        expect(file.id[0]).toBe(repositoryURL);
        expect(file.id[1]).toBe(gitHash);
        expect(file.id[2]).toBe(actualPath);
      }
      done();
    }, 1000);
  });
});
