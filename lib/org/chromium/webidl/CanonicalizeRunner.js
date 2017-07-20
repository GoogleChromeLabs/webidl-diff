// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizeRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.Canonicalizer'],

  constants: {
    MISSING_PROPS: 'Missing required properties in PipelineMessage',
  },

  properties: [
    {
      name: 'canonicalizer_',
      factory: function() {
        return this.Canonicalizer.create({
          done: console.log, // this.output
        });
      },
    },
  ],

  methods: [
    function run(message) {
      console.log(message);

      // If SUPER threw an error, we are done.
      var sup = this.SUPER(message);
      if (sup) return;

      var asts = message.ast;
      var file = message.idlFile;
      var renderer = message.renderer;

      // Verify expected parameters are present.
      if (!asts || !file || !renderer)
        return this.error(this.fmtErrorMsg(this.MISSING_PROPS));

      // Insert all of the given ASTs
      asts.forEach(function(ast) {
        var id = file.id.concat('/');
        this.canonicalizer_.addFragment(renderer, ast, id);
      }.bind(this));
    },
  ],
});
