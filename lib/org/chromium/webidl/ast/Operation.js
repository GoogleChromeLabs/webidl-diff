// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Operation',
  extends: 'org.chromium.webidl.ast.MemberData',
  implements: [
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Returner',
    'org.chromium.webidl.ast.Parameterized',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.OperationQualifier',
      name: 'qualifiers',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      for (var i = 0; i < this.qualifiers.length; i++) {
        o.out(this.qualifiers[i].label, ' ');
      }
      o.output(this.returnType).out(' ');
      if (this.name) o.output(this.name);
      o.forEach(
        this.args, '(', ')', ','
      ).out(';');
    },
  ],
});
