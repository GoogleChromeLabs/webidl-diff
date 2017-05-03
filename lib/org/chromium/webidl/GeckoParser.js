// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'GeckoParser',
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
              return repeat0(alt(
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
                  seq('#', repeat0(notChars('\r\n')))));
            },
            this.Parsers.create(),
            this);
      },
    },
  ],

  methods: [
    function symbolsFactory() {
      return Object.assign(this.SUPER(), foam.Function.withArgs(
          function(alt, sym, tseq, tplus, trepeat) {
            return {
              // Definitions may include interface forward declarations.
              Definitions: trepeat(alt(
                  sym('InterfaceFwdDecl'),
                  tseq(sym('ExtendedAttributeList'), sym('Definition')))),
              InterfaceFwdDecl: tseq('interface', sym('identifier'), ';'),
              // InterfaceMembers may include "jsonifier;" member.
              InterfaceMembers: trepeat(alt(
                  sym('Jsonifier'),
                  tseq(sym('ExtendedAttributeList'), sym('InterfaceMember')))),
              Jsonifier: tseq('jsonifier', ';'),
            };
          },
          this.TokenParsers.create({separator: this.separator}),
          this));
    },
    function actionsFactory() {
      var parser = this;
      var superActions = this.SUPER();
      var Definitions = superActions.Definitions;
      var InterfaceMembers = superActions.InterfaceMembers;
      // For Definitions and InterfaceMembers:
      // Filter out unnecessary fwd decls and "jsonifier;"s, then apply base
      // class action.
      return Object.assign(superActions, {
        Definitions: function(v) {
          return Definitions.call(
              this, v.filter(function(def) { return def !== null; }));
        },
        InterfaceFwdDecl: function() { return null; },
        InterfaceMembers: function(v) {
          return InterfaceMembers.call(
              this, v.filter(function(m) { return m !== null; }));
        },
        Jsonifier: function() { return null; },
      });
    },
  ],
});
