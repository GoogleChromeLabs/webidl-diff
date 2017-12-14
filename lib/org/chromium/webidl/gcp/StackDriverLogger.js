// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('foam2');

foam.ENUM({
  refines: 'foam.log.LogLevel',

  properties: [
    {
      class: 'String',
      name: 'stackDriverSeverity',
    },
  ],
});

foam.log.LogLevel.DEBUG.stackDriverSeverity = 'DEBUG';
foam.log.LogLevel.INFO.stackDriverSeverity = 'INFO';
foam.log.LogLevel.WARN.stackDriverSeverity = 'WARN';
foam.log.LogLevel.ERROR.stackDriverSeverity = 'ERROR';

foam.CLASS({
  package: 'org.chromium.webidl.gcp',
  name: 'StackDriverLogger',
  implements: ['foam.log.Logger'],

  documentation: `Export StackDriver logging functions`,

  requires: ['foam.log.LogLevel'],
  imports: [
    'gcloudProjectId',
    'gcloudEnv',
  ],
  exports: [
    'debug',
    'log',
    'info',
    'warn',
    'error'
  ],

  properties: [
    {
      class: 'String',
      name: 'logName',
      factory: function() {
        return this.gcloudProjectId;
      },
    },
    {
      class: 'Function',
      name: 'debug',
      factory: function() { return this.put.bind(this, this.LogLevel.DEBUG); }
    },
    {
      class: 'Function',
      documentation: 'Synonym for "info".',
      name: 'log',
      factory: function() { return this.put.bind(this, this.LogLevel.INFO); }
    },
    {
      class: 'Function',
      name: 'info',
      factory: function() { return this.put.bind(this, this.LogLevel.INFO); }
    },
    {
      class: 'Function',
      name: 'warn',
      factory: function() { return this.put.bind(this, this.LogLevel.WARN); }
    },
    {
      class: 'Function',
      name: 'error',
      factory: function() { return this.put.bind(this, this.LogLevel.ERROR); }
    },
    {
      name: 'metadata_',
      factory: function() {
        return {
          project_id: this.gcloudProjectId,
          env: this.gcloudEnv.toString(),
        };
      },
    },
    {
      name: 'logger_',
      factory: function() {
        return new require('@google-cloud/logging').Logging({
          projectId: this.gcloudProjectId,
        }).log(this.logName);
      },
    },
  ],

  methods: [
    function put(logLevel) {
      const metadata = Object.assign({}, this.metadata_, {
        severity: logLevel.stackDriverSeverity,
      });
      const args = Array.from(arguments).slice(1);
      if (args.length === 0) return;
      if (args.length == 1) {
        this.logger_.write(this.logger_.entry(metadata, args[0]));
        return;
      }
      let data = {};
      for (let i = 0; i < args.length; i++) {
        data[i] = args[i];
      }
      this.logger_.write(this.logger_.entry(metadata, data));
    },
  ],
});
