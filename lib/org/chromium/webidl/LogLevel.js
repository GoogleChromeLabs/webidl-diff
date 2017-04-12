// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'LogLevel',

  properties: [
    {
      class: 'String',
      name: 'shortName',
    },
    {
      class: 'String',
      name: 'consoleMethodName',
    },
  ],

  values: [
    {
      name: 'DEBUG',
      shortName: 'DEBG',
      label: 'Debug',
      consoleMethodName: 'debug',
    },
    {
      name: 'INFO',
      shortName: 'INFO',
      label: 'Info',
      consoleMethodName: 'info',
    },
    {
      name: 'WARN',
      shortName: 'WARN',
      label: 'Warn',
      consoleMethodName: 'warn',
    },
    {
      name: 'ERROR',
      shortName: 'ERRR',
      label: 'Error',
      consoleMethodName: 'error',
    },
  ],
});
