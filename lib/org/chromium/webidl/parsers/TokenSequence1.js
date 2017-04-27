// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'TokenSequence1',
  extends: 'foam.parse.Sequence1',
  implements: ['org.chromium.webidl.parsers.TokenizedParser'],

  documentation: `A foam.parse.Sequence1, with each part separated by
    "separator".`,

  methods: [
    // TODO: Write compile() for compiled parser support.

    function parse(ps, obj) {
      var ret;
      var args = this.args;
      var sep = this.separator;
      var n = this.n;
      for (var i = 0, p; p = args[i]; i++) {
        if (!(ps = p.parse(ps, obj))) return undefined;
        if (i === n) ret = ps.value;

        if (i === args.length - 1) continue;

        if (!(ps = sep.parse(ps, obj))) return undefined;
      }
      return ps.setValue(ret || '');
    },
    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for (var i = 0; i < args.length; i++) {
        strs[i] = args[i].toString();
      }
      return 'tseq1(' + this.n + ', ' + strs.join(', ') + ')';
    }
  ],
});
