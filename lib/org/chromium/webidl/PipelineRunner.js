// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'PipelineRunner',
  extends: 'foam.box.Runnable',

  requires: [
    'foam.box.LogBox',
    'foam.log.LogLevel',
  ],

  constants: {
    MISSING_PROPS: 'Missing required properties in PipelineMessage!',
  },

  properties: [
    {
      name: 'errorBox',
      factory: function() {
        return this.LogBox.create({
          name: `LogBox:${this.cls_.id}:${this.$UID}`,
          logLevel: this.LogLevel.ERROR,
        });
      },
    },
  ],

  methods: [
    function fmtErrorMsg(msg) {
      return new Error(`${this.cls_.name}: ${msg}`);
    },
    function validateMessage(msg) {
      if (!this.inputType.isInstance(msg)) {
        var errorMsg = this.fmtErrorMsg(
            `run() expects a ${this.inputType.name} object!`);
        this.error(errorMsg);
        return errorMsg;
      }
    },
    function output(msg) {
      if (!this.outputType.isInstance(msg))
        console.warn(`${this.cls_.name}: Message does not match outputType!`);
      this.SUPER(msg);
    },
  ],
});
