// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractorRunner',
  extends: 'foam.box.Runnable',

  documentation: 'Runnable Box that extracts IDL Fragments from HTMLFileContents.',

  methods: [
    function run(args) {
      var self = this;
      var file = args.file;
      var parser = args.parser;

      var Extractor = foam.lookup('org.chromium.webidl.IDLFragmentExtractor');
      var IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
      var idlFragments = Extractor.create({file: file}).idlFragments || [];

      idlFragments.forEach(function(fragment) {
        var idlFile = IDLFileContents.create({
          metadata: file,
          contents: fragment,
        });
        self.output({ parser: parser, file: idlFile });
      });
    },
  ],
});
