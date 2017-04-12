// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.INTERFACE({
  package: 'org.chromium.webidl',
  name: 'Logger',

  methods: [
    {name: 'debug', documentation: 'Log at "debug" log level.'},
    {name: 'log', documentation: 'Log at "log" log level.'},
    {name: 'info', documentation: 'Log at "info" log level.'},
    {name: 'warn', documentation: 'Log at "warn" log level.'},
    {name: 'error', documentation: 'Log at "error" log level.'},
  ],
});
