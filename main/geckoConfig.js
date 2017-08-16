// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
var GeckoParser = foam.lookup('org.chromium.webidl.GeckoParser');

var config = {
  source: WebPlatformEngine.GECKO,
  parserClass: GeckoParser,
  repositoryURL: 'https://github.com/mozilla/gecko-dev.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/gecko/git'),
  sparsePath: 'dom',
  findExcludePatterns: ['*/test/*'],
  extension: 'webidl',
  freshRepo: true, // Forces the latest copy of repo to be fetched.
};
config.idlFileContentsFactory = function(path, contents) {
  return IDLFileContents.create({
    metadata: GithubIDLFile.create({
      repository: this.repositoryURL,
      githubBaseURL: 'https://github.com/mozilla/gecko-dev',
      revision: this.commit,
      path: path,
    }),
    contents: contents,
  });
};
module.exports = { config };
