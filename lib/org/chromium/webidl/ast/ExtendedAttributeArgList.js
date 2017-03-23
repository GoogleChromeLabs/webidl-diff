// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'ExtendedAttributeArgList',
  extends: 'org.chromium.webidl.ast.ExtendedAttribute',
  implements: [
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Parameterized',
  ],

  methods: [
    function outputWebIDL(o) {
      o.outputObj(this.name).forEach(this.args, '(', ')', ',');
    },
  ],
});
