// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var gitilesBaseURL = 'https://chromium.googlesource.com/chromium/src/+';
var config = {
  description: 'Blink IDL file Fetch and Parse manual test',
  repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
  sparsePath: 'third_party/WebKit/Source',
  findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
  extension: 'idl',
  // Using the default parser for Blink IDL.
  parser: 'Parser',
};
config.idlFileContentsFactory = function(path, contents) {
  // Classes are injected by parseIDLFileDAOTest.
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
global.parseIDLFileTest(config);
