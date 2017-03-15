// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'ParserWithAction',
  refines: 'foam.parse.ParserWithAction',

  documentation: 'Pass start/end string position to semantic actions.',

  methods: [
    {
      name: 'parse',
      documentation: 'Pass start/end string offset to semantic actions.',
      code: function(ps, obj) {
        var start = ps.pos;
        ps = this.p.parse(ps, obj);
        return ps ?
            ps.setValue(this.action(ps.value, start, ps.pos)) :
            undefined;
      },
    },
  ],
});
