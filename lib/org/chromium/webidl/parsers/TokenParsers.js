// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'TokenParsers',
  extends: 'org.chromium.webidl.parsers.Parsers',

  documentation: `An extension of foam.parse.Parsers with tokenized shorthands
    prefixed with "t".`,

  // TODO(markdittmer): Implement complete parser description in
  // someParser.toString(). Right now, all separator parsers
  // of the same class share the same multion instance.
  axioms: [
    // Reuse TokenParsers if created with same separator.
    foam.pattern.Multiton.create({property: 'separator'}),
  ],

  properties: [
    {
      name: 'separator',
      class: 'foam.parse.ParserProperty',
      final: true,
    },
  ],

  methods: [
    function sep() { return this.separator; },
    function tseq() {
      return foam.lookup('org.chromium.webidl.parsers.TokenSequence').create({
        args: Array.from(arguments),
        separator: this.separator,
      });
    },
    function tseq1(n) {
      return foam.lookup('org.chromium.webidl.parsers.TokenSequence1').create({
        args: Array.from(arguments).slice(1),
        n: n,
        separator: this.separator,
      });
    },
    function trepeat(p, delim, min) {
      return foam.lookup('org.chromium.webidl.parsers.TokenRepeat').create({
        p: p,
        minimum: min || 0,
        delimiter: delim,
        separator: this.separator,
      });
    },
    function tplus(p, delim) {
      return foam.lookup('org.chromium.webidl.parsers.TokenPlus').create({
        p: p,
        delimiter: delim,
        separator: this.separator,
      });
    },
  ],
});
