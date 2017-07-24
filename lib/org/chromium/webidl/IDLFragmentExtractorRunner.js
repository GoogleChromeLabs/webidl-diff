// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractorRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: [
    'org.chromium.webidl.PipelineMessage',
    'org.chromium.webidl.IDLFragmentExtractor as Extractor',
    'org.chromium.webidl.IDLSpecFile',
  ],

  documentation: 'Runnable Box that extracts IDL Fragments from HTMLFileContents.',

  constants: {
    MISSING_HTML: 'Input object does not contain an HTML file.',
  },

  methods: [
    function run(message) {
      // validateMessage returned an error.
      if (this.validateMessage(message)) return;

      if (!message.htmlFile) {
        this.error(this.fmtErrorMsg(this.MISSING_HTML));
        return;
      }

      var self = this;
      var file = message.htmlFile;

      // Extract the IDL fragments and send fragments as we receive them.
      var idlFragments = this.Extractor.create().extract(file);
      idlFragments.forEach(function(fragment) {
        var newMsg = message.clone();
        newMsg.idlFile = self.IDLSpecFile.create({
          metadata: file,
          contents: fragment,
        });
        self.output(newMsg);
      });
    },
  ],
});
