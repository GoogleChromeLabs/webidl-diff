// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'BaseParser',

  requires: [
      'foam.parse.ImperativeGrammar',
      'foam.parse.StringPStream'
  ],

  exports: [ 'source' ],

  constants: {
    PARSE_COMPLETE: 'Parse complete',
    PARSE_INCOMPLETE: 'Parse incomplete'
  },

  properties: [
    {
      name: 'symbols',
      documentation: 'Map of { <symbol name>: <parser function> }.',
      factory: function() { return this.symbolsFactory(); },
    },
    {
      name: 'actions',
      documentation: 'Map of {<symbol name>: <parser action>}.',
      factory: function() { return this.actionsFactory(); },
    },
    {
      name: 'separator',
      documentation: 'Token separator. E.g., parser: "comment or whitespace".',
    },
    {
      name: 'grammar',
      documentation: 'Grammar derived from "symbols", "actions", "separator".',
      factory: function() {
        var grammar = this.ImperativeGrammar.create({symbols: this.symbols});
        grammar.addActions(this.actions);
        return grammar;
      }
    },
    {
      name: 'ps',
      documentation: 'String parser stream for synchronously parsing strings.',
      factory: function() {
        return this.StringPStream.create();
      },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.BaseIDLFile',
      name: 'source',
      documentation: 'The source of the data we are currently parsing.',
    },
  ],

  methods: [
    {
      name: 'symbolsFactory',
      documentation: `Invoked by "symbols" factory. Method used for SUPER()
          support; implementers use:
          return Object.assign(this.SUPER(), <additional symbols>);`,
      code: function() { return {}; },
    },
    {
      name: 'actionsFactory',
      documentation: `Invoked by "actions" factory; Method used for SUPER()
          support; implementers use:
          return Object.assign(this.SUPER(), <additional actions>);`,
      code: function() { return {}; },
    },
    {
      name: 'parseString',
      documentation: `Parse "str", starting from parser symbol START, or
          "opt_name" (if defined).`,
      code: function(str, source, opt_name) {
        opt_name = opt_name || 'START';
        this.source = source;
        this.ps.setString(str);
        var start = this.grammar.getSymbol(opt_name);
        foam.assert(start, 'No symbol found for', opt_name);

        return start.parse(this.ps, this.grammar);
      },
    },
    {
      name: 'logParse',
      documentation: 'Like "parseString"; log (in)complete parse status.',
      code: function(str, opt_name) {
        var result = this.parseString(str, opt_name);
        if (result && result.pos === str.length) console.info(this.PARSE_COMPLETE);
        else console.warn(this.PARSE_INCOMPLETE);
        return result;
      },
    },
  ],
});
