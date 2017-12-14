// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const process = require('process');
const projectId = process.env.GCLOUD_PROJECT_ID;
if (!projectId) {
  throw new Error('Failed to get environment variable GCLOUD_PROJECT_ID');
  process.exit(1);
}
const Logging = require('@google-cloud/logging');
const logging = new Logging({projectId});
const logger = logging.log(projectId);
const isProd = process.env.PROD;
const logContext = isProd ? {
  prod: true,
} : {
  dev: true
};

const __console__ = global.console;
console.log = global.console.log = function() {
  const context = Object.assign({}, logContext, {logLevel: 'info'});
  return logger.write(logger.entry(context, arguments));
};

console.log('hello', true, {foo: null});
