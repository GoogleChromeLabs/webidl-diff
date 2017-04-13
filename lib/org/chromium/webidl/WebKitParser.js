// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'WebKitParser',
  extends: 'org.chromium.webidl.Parser',

  requires: [
    'org.chromium.webidl.Parser',
    'org.chromium.webidl.parsers.TokenParsers',
  ],

  properties: [
    {
      name: 'separator',
      factory: function() {
        return foam.Function.withArgs(
            function(plus0, alt, seq1, repeat0, notChars, seq) {
              return seq( // HACK: Different class than base class's "separator"
                  repeat0(alt(
                      // Whitespace.
                      alt(' ', '\t', '\n', '\r', '\f'),
                      // Single-line comment.
                      seq(
                          '//',
                          repeat0(notChars('\r\n')), alt('\r\n', '\n')),
                      // Multi-line comment.
                      seq1(
                          1,
                          '/*',
                          repeat0(alt(notChars('*'), seq('*', notChars('\/')))),
                          '*\/'),
                      // C-style preprocessor directives.
                      seq('#', repeat0(notChars('\r\n'))))));
            },
            this.Parsers.create(),
            this);
      },
    },
  ],

  methods: [
    function symbolsFactory() {
      return Object.assign(this.SUPER(), foam.Function.withArgs(
          function(alt, sym, tseq, tplus) {
            return {
              ExtendedAttribute: alt(
                  sym('ExtendedAttributeIdentList'),
                  sym('ExtendedAttributeNamedArgList'),
                  sym('ExtendedAttributeIdentifierOrString'),
                  sym('ExtendedAttributeArgList'),
                  sym('ExtendedAttributeLogicalOperators'),
                  sym('ExtendedAttributeNoArgs')),
              ExtendedAttributeLogicalOperators: tseq(
                  sym('identifier'), '=', tplus(sym('identifier'),
                                                alt('&', '|'))),
            };
          },
          this.TokenParsers.create({separator: this.separator}),
          this));
    },
    function actionsFactory() {
      var parser = this;
      return Object.assign(this.SUPER(), {
        ExtendedAttributeLogicalOperators: function(v) {
          // Treat custom "foo = a & b | c" like standard "foo=(a,b,c)".
          return parser.ExtendedAttributeIdentList.create({
            name: v[0],
            args: v[2],
          });
        },
      });
    },
  ],
});
