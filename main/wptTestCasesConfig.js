// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
var Parser = foam.lookup('org.chromium.webidl.Parser');

var config = {
  source: WebPlatformEngine.WEBKIT,
  parserClass: Parser,
  repositoryURL: 'https://github.com/w3c/web-platform-tests.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/wpt/git'),
  sparsePath: 'WebIDL',
  findExcludePatterns: ['*/invalid/*'],
  extension: 'widl',
};
config.idlFileContentsFactory = function (path, contents, urls) {
  return IDLFileContents.create({
    metadata: GithubIDLFile.create({
      repository: this.repositoryURL,
      githubBaseURL: 'https://github.com/w3c/web-platform-tests',
      revision: this.commit,
      path: path,
    }),
    contents: contents,
    specUrls: urls,
  });
};
module.exports = { config };
