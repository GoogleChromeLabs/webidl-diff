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
    'org.chromium.webidl.CanonicalCollection',
  ],

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
    function fmtErrorMsg(msg, fnName) {
      return `${this.cls_id}.${fnName}(): ${msg}`;
    },
    function validateMessage(msg) {
      if (!this.inputType.isInstance(msg)) {
        var errorMsg = this.fmtErrorMsg(
            `Expects an instance of ${this.inputType.name} object as input!`,
            'run');
        this.error(new Error(errorMsg));
        return errorMsg;
      }
    },
    function output(msg) {
      if (!this.outputType.isInstance(msg))
        console.warn(
            this.fmtErrorMsg('Message does not match outputType!', 'output'));
      this.SUPER(msg);
    },
  ],
});
