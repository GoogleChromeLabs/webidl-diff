// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'ParserRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.BaseParser'],

  documentation: 'Runnable Box that parsers IDLFileContents into ASTs.',

  properties: [
    {
      class: 'Class',
      documentation: 'Class of the parser used to parse the IDL files.',
      name: 'parserType',
      value: 'org.chromium.webidl.Parser',
    },
    {
      class: 'String',
      name: 'ioRelationshipType',
      documentation: 'The n:m relationship type of input-to-output.',
      value: '1:*',
    },
    {
      class: 'Class',
      documentation: 'Type of input parameter of run().',
      name: 'inputType',
      value: 'org.chromium.webidl.BaseIDLFile',
    },
    {
      class: 'Class',
      documentation: 'Type of output values produced by run().',
      name: 'outputType',
      value: 'org.chromium.webidl.ast.Definition',
    },
    {
      documentation: 'An instance of the parser class.',
      name: 'parser_',
      factory: function() {
        return this.parserType.create();
      },
    },
  ],

  methods: [
    function init() {
      foam.assert(this.BaseParser.isInstance(this.parser_),
          'ParserRunner: Expected to receive a valid parser class.');
      this.SUPER();
    },
    function run(file) {
      if (this.validateMessage(file)) return;

      // Prepare metadata to be injected by parser.
      var sourceId = file.cls_.create({id: file.id});
      var results = this.parser_.parseString(file.contents, sourceId);

      // Determine if parse of entire file was successful.
      if (!Array.isArray(results.value) ||
          file.contents.length !== results.pos) {
        var errMsg = this.fmtErrorMsg(
            `Incomplete parse on file.
            Source: ${foam.json.Pretty.stringify(sourceId)}`,
            'run');
        this.error(new Error(errMsg));
      } else {
        var asts = results.value;
        asts.forEach(function(ast) {
          this.output(ast);
        }.bind(this));
      }
    }
  ],
});
