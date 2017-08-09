// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'ExtendedAttributeNoArgs',
  extends: 'org.chromium.webidl.ast.ExtendedAttribute',
  implements: [
    'org.chromium.webidl.ast.Named',
  ],

  properties: [
    {
      name: 'id',
      factory: function() { return this.getName(); },
    },
  ],

  methods: [
    function outputWebIDL(o) {
      o.outputObj(this.name);
    },
  ],
});
