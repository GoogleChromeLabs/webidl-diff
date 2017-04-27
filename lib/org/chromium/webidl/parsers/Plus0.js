// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'Plus0',
  extends: 'foam.parse.ParserDecorator',

  documentation: `Like foam.parse.Repeat0, but one-or-more, rather than
    zero-or-more.`,

  methods: [
    // TODO(markdittmer): Write compile() for compiled parser support.
    function parse(ps, obj) {
      var res;
      var found;
      var p = this.p;
      while (res = p.parse(ps, obj)) {
        found = true;
        ps = res;
      }
      if (found === undefined) return undefined;
      return ps.setValue('');
    },
    function toString() {
      debugger;
      return 'plus0(' + this.SUPER() + ')';
    },
  ],
});
