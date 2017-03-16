// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Ensure that FOAM is loaded before requiring FOAM code.
require('./foam-helper.js');

beforeAll(function() {
  // TODO(markdittmer): Use FOAM ClassLoader instead after
  // https://github.com/foam-framework/foam2/issues/262 is resolved.
  var path = require('path');
  var rootDir = path.resolve(__dirname, '..', '..');

  // Load files into global.WEB_IDL_DIFF_FILES.
  require(path.resolve(rootDir, 'config', 'files.js'));

  var files = global.WEB_IDL_DIFF_FILES.slice();
  for (var i = 0; i < files.length; i++) {
    require(path.resolve(rootDir, files[i]));
  }
});
