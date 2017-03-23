// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Member',
  implements: [
    'org.chromium.webidl.ast.Attributed',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.MemberData',
      name: 'member',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.attrs.length > 0)
        o.forEach(this.attrs, '[', ']', ',').newline().indent();
      o.outputObj(this.member);
    },
  ],
});
