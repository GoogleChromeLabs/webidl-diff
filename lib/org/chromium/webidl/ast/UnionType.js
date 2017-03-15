// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'UnionType',
  extends: 'org.chromium.webidl.ast.Type',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.Type',
      name: 'types',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      o.forEach(this.types, '(', ')', ' or');
      this.SUPER(o);
    },
  ],
});
