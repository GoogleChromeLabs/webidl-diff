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
    'org.chromium.webidl.IDLFileContents',
  ],

  documentation: 'Runnable Box that extracts IDL Fragments from HTMLFileContents.',

  methods: [
    function run(message) {
      var sup = this.SUPER(message);

      // If SUPER threw an error, do not proceed.
      if (sup) return;

      if (!message.htmlFile) {
        this.error(this.fmtErrorMsg('No HTML file was provided!'));
        return;
      }

      var self = this;
      var file = message.htmlFile;

      // Extract the IDL fragments and send fragments as we receive them.
      var idlFragments = this.Extractor.create({file: file}).idlFragments || [];
      idlFragments.forEach(function(fragment) {
        var newMsg = message.clone();
        newMsg.idlFile = self.IDLFileContents.create({
          metadata: file,
          contents: fragment,
        });
        self.output(newMsg);
      });
    },
  ],
});
