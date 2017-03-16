// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Run all tests in Karma.

const base = require('./karma.conf.js');

module.exports = function(config) {
  base(config);

  let preprocessors = Object.assign({}, base.preprocessors);
  preprocessors[`${base.ROOT_DIR}/lib/**/*.js`] = ['coverage'];

  config.set({
    files: base.deps
      .concat(base.entries)
      .concat(base.helpers)
      .concat(base.units)
      .concat(base.integrations),

    reporters: (base.reporters || []).concat(['coverage']),
    preprocessors,
    coverageReporter: {
      type: 'html',
      dir: `${base.ROOT_DIR}/.web_coverage`,
    },
  });
};
