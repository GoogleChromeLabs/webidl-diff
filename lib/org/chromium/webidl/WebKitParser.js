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
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.Parser',
      name: 'base',
      // TODO(markdittmer): Figure out a cleaner extension mechanism.
      factory: function() { return this.Parser.create(); }
    },
    {
      name: 'separatorFactory',
      value: function(plus0, alt, seq1, repeat0, notChars, seq) {
        return repeat0(alt(
          // Whitespace.
          alt(' ', '\t', '\n', '\r', '\f'),
          // Single-line comment.
          seq(
            '//',
            repeat0(notChars('\r\n')), alt('\r\n', '\n')
          ),
          // Multi-line comment.
          seq1(
            1,
            '/*',
            repeat0(alt(notChars('*'), seq('*', notChars('\/')))),
            '*\/'
          ),
          // C-style preprocessor directives.
          seq('#', repeat0(notChars('\r\n')))
        ));
      },
    },
    {
      // The core query parser. Needs a fieldname symbol added to function
      // properly.
      name: 'symbolsFactory',
      value: function(alt, sym, tseq, tplus) {
        return Object.assign({}, this.base.symbols, {
          ExtendedAttribute: alt(
            sym('ExtendedAttributeLogicalOperators'),
            this.base.symbols.ExtendedAttribute
          ),
          ExtendedAttributeLogicalOperators: tseq(
            sym('identifier'), '=', tplus(sym('identifier'), alt('&', '|'))
          ),
        });
      },
    },
    {
      name: 'actions',
      factory: function() {
        var parser = this;
        return Object.assign({}, this.base.actions, {
          ExtendedAttributeLogicalOperators: function(v) {
            // Treat custom "foo = a & b | c" like standard "foo=(a,b,c)".
            return parser.ExtendedAttributeIdentList.create({
              name: v[0],
              args: v[2],
            });
          },
        });
      },
    },
  ],
});
