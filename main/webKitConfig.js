// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
var WebKitParser = foam.lookup('org.chromium.webidl.WebKitParser');

var githubBaseURL = 'https://github.com/WebKit/webkit';
var config = {
  source: WebPlatformEngine.WEBKIT,
  parserClass: WebKitParser,
  repositoryURL: 'https://github.com/WebKit/webkit.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/WebKit/git'),
  sparsePath: 'Source/WebCore',
  findExcludePatterns: ['*/testing/*', '*/test/*', '*/deprecated/*'],
  extension: 'idl',
  freshRepo: true, // Forces the latest copy of repo to be fetched.
};
config.idlFileContentsFactory = function(path, contents) {
  return IDLFileContents.create({
    metadata: GithubIDLFile.create({
      repository: this.repositoryURL,
      githubBaseURL: githubBaseURL,
      revision: this.commit,
      path: path,
    }),
    contents: contents,
  });
};
module.exports = { config };
