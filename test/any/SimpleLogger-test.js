// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('SimpleLogger', function() {
  var captureLogger;
  var testCtx;
  var LogLevel;
  var logLevels = ['debug', 'info', 'warn', 'error'];

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'CaptureLogger',
      implements: ['org.chromium.webidl.Logger'],

      exports: [
        'debug',
        'log',
        'info',
        'warn',
        'error',
      ],

      properties: logLevels.map(function(name) {
        return {
          class: 'Array',
          name: name + 's',
        };
      }),

      methods: logLevels.map(function(name) {
        return {
          name: name,
          code: function() { this[name + 's'].push(Array.from(arguments)); },
        };
      }).concat([{
        name: 'clear',
        code: function() {
          var self = this;
          logLevels.forEach(function(name) { self[name + 's'] = []; });
        },
      }])
    });
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'SimpleLogger',
      extends: 'org.chromium.webidl.SimpleLogger',

      properties: [
        ['getDateString', function() { return 'DATE'; }],
      ],
    });
    LogLevel = foam.lookup('org.chromium.webidl.LogLevel');
    testCtx = foam.lookup('org.chromium.webidl.test.SimpleLogger').create(
      null,
      captureLogger =
          foam.lookup('org.chromium.webidl.test.CaptureLogger').create()
    ).__subContext__;
  });

  it('should output strings', function() {
    logLevels.forEach(function(logLevel) {
      testCtx[logLevel]('frobinator');
      expect(captureLogger[logLevel + 's']).toEqual([[
        LogLevel[logLevel.toUpperCase()].shortName, '[DATE]', 'frobinator'
      ]]);
      captureLogger.clear();
    });
  });

  it('should send "log" method to log level "info"', function() {
    testCtx.log('frobinator');
    expect(captureLogger.infos).toEqual([[
      LogLevel.INFO.shortName, '[DATE]', 'frobinator'
    ]]);
  });

  it('should output varied objects', function() {
    logLevels.forEach(function(logLevel) {
      var o = {};
      var fo = foam.core.FObject.create();
      var a = [o];
      testCtx[logLevel](a, o, fo, undefined, null, 'frobinator', true, 3.14);
      expect(captureLogger[logLevel + 's']).toEqual([[
        LogLevel[logLevel.toUpperCase()].shortName, '[DATE]',
        a, o, fo, undefined, null, 'frobinator', true, 3.14
      ]]);
      captureLogger.clear();
    });
  });
});
