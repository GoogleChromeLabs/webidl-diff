// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'ParserRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  documentation: 'Runnable Box that parsers IDLFileContents into ASTs.',

  methods: [
    function run(message) {
      var sup = this.SUPER(message);

      // If SUPER threw an error, we cannot proceed.
      if (sup) return;

      // Verify all required arguments are present.
      if (!message.idlFile || !message.parser)
        return this.error(this.fmtErrorMsg(this.MISSING_PROPS));

      var file = message.idlFile;
      var parser = message.parser;

      // Load appropriate parser depending on configuration.
      // TODO: Replace injected string with a safer method, such as a
      // helper method that chooses parser based on URL.
      var parser = foam.lookup(`org.chromium.webidl.${parser}`).create();
      var results = parser.parseString(file.contents);

      // Determine if parse of entire file was successful.
      if (file.contents.length !== results.pos) {
        var metadata = file.metadata || {};
        var id = `
          Repository: ${metadata.repository}
          Path: ${metadata.path}
          Revision: ${metadata.revision}`;

        this.error(new Error(`Incomplete parse on file. Metadata: ${id}`));
      } else {
        message.ast = results.value;
        this.output(message);
      }
    }
  ],
});
