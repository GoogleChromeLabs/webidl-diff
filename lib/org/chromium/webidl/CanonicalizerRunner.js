// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizerRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.Canonicalizer'],

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
          onDone: this.output.bind(this),
          waitTime: this.waitTime,
        });
      },
    },
  ],

  methods: [
    function run(message) {
      if (this.validateMessage(message)) return;

      var asts = message.ast;
      var file = message.idlFile;
      var source = message.source;

      // Verify expected parameters are present.
      if (!asts || !file || !source) {
        this.error(this.fmtErrorMsg(
            'Missing ast, file and/or source in message object.'));
        return;
      }

      // Insert all of the given ASTs.
      asts.forEach(function(ast) {
        this.canonicalizer_.addFragment(source, ast);
      }.bind(this));
    },
  ],
});
