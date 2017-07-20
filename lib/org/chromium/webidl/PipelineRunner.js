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
    'org.chromium.webidl.PipelineMessage',
  ],

  constants: {
    INVALID_ARG: `run() expects a PipelineMessage object!`,
    MISSING_PROPS: 'Missing required properties in PipelineMessage!',
  },

  classes: [
    {
      name: 'ErrorBox',
      extends: 'foam.box.LogBox',

      requires: ['foam.log.LogLevel'],

      properties: [
        {
          name: 'logLevel',
          factory: function() { return this.LogLevel.ERROR; },
        }
      ],

      methods: [
        function send(message) {
          var output = message.object;
          this[this.logLevel.consoleMethodName].apply(this, [
            this.name,
            output instanceof Error ? output.toString() :
                foam.json.Pretty.stringify(message)
          ]);
          this.delegate && this.delegate.send(message);
        }
      ],
    },
  ],

  properties: [
    {
      name: 'errorBox',
      factory: function() {
        return this.ErrorBox.create({
          name: `LogBox:${this.cls_.id}:${this.$UID}`,
        });
      },
    },
  ],

  methods: [
    function fmtErrorMsg(msg) {
      return new Error(`${this.cls_.name}: ${msg}`);
    },
    function run(message) {
      if (!this.PipelineMessage.isInstance(message)) {
        var errorMsg = this.fmtErrorMsg(this.INVALID_ARG);
        this.error(errorMsg);
        return errorMsg;
      }
    },
  ],
});
