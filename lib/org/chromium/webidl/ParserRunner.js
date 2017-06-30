// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'ParserRunner',
  extends: 'foam.box.Runnable',

  requires: ['org.chromium.webidl.PipelineMessage'],

  documentation: 'Runnable Box that parsers IDLFileContents into ASTs',

  methods: [
    function run(message) {
      if (!this.PipelineMessage.isInstance(message))
        throw new Error("ParserRunner: Run() expects a PipelineMessage object!");
      else if (!message.idlFile || !message.parser)
        throw new Error("ParserRunner: Missing required properties in PipelineMessage!");

      var file = message.idlFile;
      var parser = message.parser;

      // Load appropriate parser depending on configuration
      var parser = foam.lookup(`org.chromium.webidl.${parser}`).create();
      message.ast = parser.parseString(file.contents).value;
      this.output(message);
    }
  ],
});
