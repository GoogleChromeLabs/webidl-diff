// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var path = require('path');

require('foam2');

var rootDir = path.resolve(__dirname, '..');
require(path.resolve(rootDir, 'config', 'files.js'));
var files = global.WEB_IDL_DIFF_FILES.slice();
for (var i = 0; i < files.length; i++) {
  require(path.resolve(rootDir, files[i]));
}

require(path.resolve(
    rootDir,
    'node_modules',
    'foam2',
    'src',
    'foam',
    'box',
    'node',
    'forkScript.js'));
