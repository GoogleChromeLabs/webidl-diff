// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const process = require('process');

const isProd = process.env.PROD;
const env = isProd ? 'PROD' : 'DEV';
const projectId = process.env.GCLOUD_PROJECT_ID;

//
// Override logging globally.
//
(() => {
  if (!projectId) {
    throw new Error('Failed to get environment variable GCLOUD_PROJECT_ID');
    process.exit(1);
  }
  const Logging = require('@google-cloud/logging');
  const logging = new Logging({projectId});
  const logger = logging.log(projectId);
  const logContext = isProd ? {
    labels: {
      project_id: projectId,
      env,
    },
  } : {
    labels: {
      project_id: projectId,
      env,
    },
  };
  const severities = {
    debug: 'DEBUG',
    log: 'INFO',
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
  };
  const bindLogFunction = name => {
    console[name] = global.console[name] = function() {
      const metadata = Object.assign({}, logContext, {
        severity: severities[name],
      });
      let data;
      if (arguments.length === 1) {
        data = arguments[0];
      } else {
        data = {};
        for (let i = 0; i < arguments.length; i++) {
          data[i] = arguments[i];
        }
      }
      logger.write(logger.entry(metadata, data));
    };
  };
  bindLogFunction('debug');
  bindLogFunction('log');
  bindLogFunction('info');
  bindLogFunction('warn');
  bindLogFunction('error');
})();

require('../lib/org/chromium/webidl/gcp/StackDriverLogger.js');

const logger = org.chromium.webidl.gcp.StackDriverLogger.create(null,
    foam.createSubContext({
      gcloudProjectId: projectId,
      gcloudEnv: env,
    }));

logger.log('Hello', 'there');
