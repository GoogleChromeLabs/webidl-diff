// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractorRunner',

  extends: 'foam.box.Runnable',

  requires: [
    'org.chromium.webidl.PipelineMessage',
    'org.chromium.webidl.IDLFragmentExtractor as Extractor',
    'org.chromium.webidl.IDLFileContents',
  ],

  documentation: 'Runnable Box that extracts IDL Fragments from HTMLFileContents.',

  methods: [
    function run(message) {
      if (!this.PipelineMessage.isInstance(message))
        throw new Error("IDLFragmentExtractorRunner: run() expects a PipelineMessage object!");
      else if (!message.htmlFile)
        throw new Error("IDLFragmentExtractorRunner: No HTML File was provided!");

      var self = this;
      var file = message.htmlFile;
      var parser = message.parser;

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
