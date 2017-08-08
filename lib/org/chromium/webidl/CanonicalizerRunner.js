// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizerRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: [
    'org.chromium.webidl.CanonicalCollection',
    'org.chromium.webidl.Canonicalizer',
    'org.chromium.webidl.ast.Definition',
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
      class: 'Enum',
      of: 'org.chromium.webidl.WebPlatformEngine',
      name: 'source',
    },
    {
      class: 'String',
      name: 'ioRelationshipType',
      documentation: 'The n:m relationship type of input-to-output.',
      value: 'many:1',
    },
    {
      class: 'Class',
      documentation: 'Type of input parameter of run().',
      name: 'inputType',
      factory: function() {
        return this.Definition;
      },
    },
    {
      class: 'Class',
      documentation: 'Type of output values produced by run().',
      name: 'outputType',
      factory: function() {
        return this.CanonicalCollection;
      },
    },
    {
      name: 'canonicalizer_',
      factory: function() {
        return this.Canonicalizer.create({
          waitTime: this.waitTime,
          onDone: function(map) {
            var msg = this.CanonicalCollection.create({
              definitions: map,
              source: this.source,
            });

            this.output(msg);
          }.bind(this),
        });
      },
    },
  ],

  methods: [
    function run(ast) {
      if (this.validateMessage(ast)) return;
      this.canonicalizer_.addFragment(ast);
    },
  ],
});
