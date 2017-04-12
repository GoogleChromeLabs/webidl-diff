// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'SimpleLogger',
  implements: ['org.chromium.webidl.Logger'],

  documentation: `Decorate contextual logging methods with log level (short
      name) and date string`,

  requires: ['org.chromium.webidl.LogLevel'],
  imports: [
    'debug as debug_',
    'log as log_',
    'info as info_',
    'warn as warn_',
    'error as error_',
  ],
  exports: [
    'debug',
    'log',
    'info',
    'warn',
    'error',
  ],

  properties: [
    {
      class: 'Function',
      name: 'debug',
      factory() { return this.put.bind(this, this.LogLevel.DEBUG); },
    },
    {
      class: 'Function',
      name: 'log',
      factory() { return this.put.bind(this, this.LogLevel.INFO); },
    },
    {
      class: 'Function',
      name: 'info',
      factory() { return this.put.bind(this, this.LogLevel.INFO); },
    },
    {
      class: 'Function',
      name: 'warn',
      factory() { return this.put.bind(this, this.LogLevel.WARN); },
    },
    {
      class: 'Function',
      name: 'error',
      factory() { return this.put.bind(this, this.LogLevel.ERROR); },
    },
    {
      class: 'Function',
      name: 'getDateString',
      factory() { return function() { return (new Date()).toString(); } },
    },
  ],

  methods: [
    function put(logLevel) {
      var args = [logLevel.shortName, '[' + this.getDateString() + ']'].concat(
          Array.from(arguments).slice(1));
      this[logLevel.consoleMethodName + '_'].apply(this, args);
    },
  ],
});
