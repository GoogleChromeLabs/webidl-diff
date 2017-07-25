// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var githubBaseURL = 'https://github.com/WebKit/webkit';
var config = {
  description: 'WebKit IDL Fetch Runner manual test',
  repositoryURL: 'https://github.com/WebKit/webkit.git',
  localRepositoryPath: require('path').resolve(__dirname, '../data/WebKit/git'),
  sparsePath: 'Source',
  findExcludePatterns: ['*/testing/*', '*/test/*'],
  extension: 'idl',
};
config.idlFileContentsFactory = function(path, contents) {
  // Classes are injected by manualLocalGitTest.
  return config.IDLFileContents.create({
    metadata: config.GithubIDLFile.create({
      repository: this.repositoryURL,
      githubBaseURL: githubBaseURL,
      revision: this.commit,
      path: path,
    }),
    contents: contents,
  });
};
global.manualLocalGitTest(config);
