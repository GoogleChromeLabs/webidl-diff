// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Simulate all tests for coverage.

var path = require('path');

function runNodeBin(name, opt_args) {
  var args = opt_args || [];
  var binPath = path.resolve(__dirname, `../node_modules/.bin/${name}`);
  global.process.argv = ['node', binPath].concat(opt_args || []);
  require(binPath);
}

runNodeBin('jasmine');
runNodeBin(
  'karma',
  ['start', path.resolve(__dirname, '../config/karma.all.conf.js')]);
