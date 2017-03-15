// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'TokenRepeat',
  extends: 'foam.parse.Repeat',
  implements: ['org.chromium.webidl.parsers.TokenizedParser'],

  documentation: `A foam.parse.Repeat, with each repitition separated by
    "separator".`,

  methods: [
    // TODO: Write compile() for compiled parser support.

    function parse_(parser, obj, pss) {
      if (!pss.ps) return;
      pss.ps = parser.parse(pss.ps, obj);
      if (pss.ps) pss.last = pss.ps;
    },
    function parse(ps, obj) {
      var pss = {ps: ps, last: ps};
      var ret = [];
      var p = this.p;
      var delim = this.delimiter;
      var sep = this.separator;
      while (pss.ps) {
        this.parse_(p, obj, pss);
        if (pss.ps) ret.push(pss.ps.value);
        else break;

        // Token separators appear before and after delimiter.
        this.parse_(sep, obj, pss);
        if (delim) {
          this.parse_(delim, obj, pss);
          this.parse_(sep, obj, pss);
        }
      }

      if (this.minimum > 0 && ret.length < this.minimum) return undefined;
      return pss.last.setValue(ret);
    },
  ],
});
