// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('./files.js');

const execSync = require('child_process').execSync;

const ROOT_DIR = `${__dirname}/..`;
const FOAM_DIR = `${ROOT_DIR}/node_modules/foam2`;

// Outputs ../node_modules/foam2-experimental/foam-bin.js
execSync(`node ${FOAM_DIR}/tools/build.js web`);

const basePath = `${ROOT_DIR}/test`;
const deps = [
  `${FOAM_DIR}/foam-bin.js`,
  `${FOAM_DIR}/test/helpers/generic_dao.js`,
  `${FOAM_DIR}/test/helpers/testcontext.js`,
];
const entries = global.WEB_IDL_DIFF_FILES.slice()
    .map(path => `${ROOT_DIR}/${path}`);
const helpers = [
  'any/**/*-helper*.js',
  'browser/**/*-helper*.js',
];
const units = [
  'any/**/*-test*.js',
  'browser/**/*-test*.js',
];
const integrations = [
  'any/**/*-integration*.js',
  'browser/**/*-integration*.js',
];
const reporters = ['progress'];
function configurator(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: deps,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters,

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    // If run in Travise CI, use firefox, otherwise use Chrome.
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // enable / disable watching file and executing tests whenever any file
    // changes
    autoWatch: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Prevent Travis CI from killing Karma before it's done.
    browserNoActivityTimeout: 150000,
  });
}

configurator.ROOT_DIR = ROOT_DIR;
configurator.FOAM_DIR = FOAM_DIR;
configurator.deps = deps;
configurator.entries = entries;
configurator.helpers = helpers;
configurator.units = units;
configurator.integrations = integrations;

module.exports = configurator;
