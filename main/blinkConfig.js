// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
var GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');

var gitilesBaseURL = 'https://chromium.googlesource.com/chromium/src/+';
var config = {
  description: 'Scrape IDL Files from Blink Repository',
  repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
  localRepositoryPath: require('path').resolve(__dirname, 'data/blink/git'),
  sparsePath: 'third_party/WebKit/Source',
  findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
  extension: 'idl',
  parser: 'Parser', // Default IDL Parser used for Blink
  IDLFileContents: IDLFileContents,
  GitilesIDLFile: GitilesIDLFile,
};
config.idlFileContentsFactory = function(path, contents) {
  // Classes are injected by ...
  return config.IDLFileContents.create({
    metadata: config.GitilesIDLFile.create({
      repository: this.repositoryURL,
      gitilesBaseURL: gitilesBaseURL,
      revision: this.commit,
      path: path,
    }),
    contents: contents,
  });
};
module.exports = { config };
