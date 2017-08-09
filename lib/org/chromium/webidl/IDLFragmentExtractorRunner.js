// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractorRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: [
    'org.chromium.webidl.IDLFragmentExtractor as Extractor',
    'org.chromium.webidl.IDLSpecFile',
  ],

  documentation: 'Runnable Box that extracts IDL Fragments from HTMLFileContents.',

  properties: [
    {
      class: 'String',
      documentation: 'The n:m relationship type of input-to-output.',
      name: 'ioRelationshipType',
      value: '1:*',
    },
    {
      class: 'Class',
      documentation: 'Type of input parameter of run().',
      name: 'inputType',
      value: 'org.chromium.webidl.HTMLFileContents',
    },
    {
      class: 'Class',
      documentation: 'Type of output values produced by run().',
      name: 'outputType',
      value: 'org.chromium.webidl.IDLSpecFile',
    },
  ],

  methods: [
    function run(file) {
      // validateMessage returned an error.
      if (this.validateMessage(file)) return;

      // Extract the IDL fragments and send fragments as we receive them.
      var idlFragments = this.Extractor.create().extract(file);
      idlFragments.forEach(function(fragment) {
        var idlFile = this.IDLSpecFile.create({
          url: file.url,
          timestamp: file.timestamp,
          contents: fragment,
        });

        this.output(idlFile);
      }.bind(this));
    },
  ],
});
