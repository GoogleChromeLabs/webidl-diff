// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'Parsers',
  refines: 'foam.parse.Parsers',

  documentation: 'Expose "plus0()" parser combinator on default Parsers.',

  methods: [
    {
      name: 'plus0',
      documentation: 'Expose plus0(p) on default FOAM Parsers.',
      code: function(p) {
        return foam.lookup('org.chromium.webidl.parsers.Plus0').create({p: p});
      },
    },
  ],
});
