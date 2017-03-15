// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Stringifier',
  extends: 'org.chromium.webidl.ast.MemberData',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Attribute',
      name: 'attribute',
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Operation',
      name: 'operation',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      o.out('stringifier');
      if (this.attribute) o.out(' ').output(this.attribute);
      else if (this.operation) o.out(' ').output(this.operation);
      else o.out(';');
    },
  ],
});
