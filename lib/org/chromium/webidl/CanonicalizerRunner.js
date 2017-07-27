// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizerRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: [
    'org.chromium.webidl.Canonicalizer',
    'org.chromium.webidl.PipelineMessage',
  ],

  properties: [
    {
      class: 'Int',
      documentation: `Amount of time in seconds to wait after the last input
        for the same source before forwarding canonical results to next runner.
        Default value is 5 minutes (300 seconds).`,
      name: 'waitTime',
      value: 300,
    },
    {
      name: 'canonicalizer_',
      factory: function() {
        return this.Canonicalizer.create({
          waitTime: this.waitTime,
          onDone: function(canonicalMap) {
            var msg = this.PipelineMessage.create({
              source: this.source,
              canonicalMap: canonicalMap,
            });

            this.output(msg);
          }.bind(this),
        });
      },
    },
  ],

  methods: [
    function run(message) {
      if (this.validateMessage(message)) return;

      var asts = message.ast;
      var file = message.idlFile;

      // Verify expected parameters are present.
      if (!asts || !file) {
        this.error(this.fmtErrorMsg(
            'Missing ast or file in message object.'));
        return;
      }

      // Insert all of the given ASTs.
      asts.forEach(function(ast) {
        this.canonicalizer_.addFragment(ast);
      }.bind(this));
    },
  ],
});
