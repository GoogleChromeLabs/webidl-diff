// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Iterable',
  extends: 'org.chromium.webidl.ast.MemberData',
  implements: [
    'org.chromium.webidl.ast.Typed',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Type',
      name: 'valueType',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      var types = [this.type];
      if (this.valueType) types.push(this.valueType);
      o.out('iterable').forEach(types, '<', '>', ',').out(';');
    },
  ],
});
