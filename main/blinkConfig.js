// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
var Parser = foam.lookup('org.chromium.webidl.Parser');

var config = {
  source: WebPlatformEngine.BLINK,
  parserClass: Parser,
  repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/blink/git'),
  sparsePath: 'third_party/WebKit/Source',
  findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
  extension: 'idl',
  freshRepo: true, // Forces the latest copy of repo to be fetched.
};
config.idlFileContentsFactory = function(path, contents, urls) {
  return IDLFileContents.create({
    metadata: GitilesIDLFile.create({
      repository: this.repositoryURL,
      gitilesBaseURL: 'https://chromium.googlesource.com/chromium/src/+',
      revision: this.commit,
      path: path,
    }),
    contents: contents,
    specUrls: urls,
  });
};
module.exports = { config };
