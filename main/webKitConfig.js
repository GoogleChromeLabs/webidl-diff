// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');

var githubBaseURL = 'https://github.com/WebKit/webkit';
var config = {
  renderer: 'WebKit',
  repositoryURL: 'https://github.com/WebKit/webkit.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/WebKit/git'),
  sparsePath: 'Source',
  findExcludePatterns: ['*/testing/*', '*/test/*', '*/deprecated/*'],
  extension: 'idl',
  parser: 'WebKitParser',
  IDLFileContents: IDLFileContents,
  GithubIDLFile: GithubIDLFile,
};
config.idlFileContentsFactory = function(path, contents) {
  // Classes are injected by ...
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
module.exports = { config };
