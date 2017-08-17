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
    {
      name: 'id',
      factory: function() {
        return this.getName();
      },
    },
  ],

  methods: [
    function getName() {
      var types = this.types.map(function(type) {
        return type.getName();
      }).join(' or ');
      return `(${types})`;
    },
    function outputWebIDL(o) {
      o.forEach(this.types, '(', ')', ' or');
      this.SUPER(o);
    },
  ],
});
