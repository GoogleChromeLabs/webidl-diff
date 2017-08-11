// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'NonUnionType',
  extends: 'org.chromium.webidl.ast.Type',
  implements: [
    'org.chromium.webidl.ast.Attributed',
    'org.chromium.webidl.ast.Named',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.Type',
      name: 'params',
    },
    {
      name: 'id',
      factory: function() {
        return this.getName();
      },
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.attrs.length > 0) {
        o.forEach(this.attrs, '[', ']', ',').newline().indent();
      }
      o.outputObj(this.name);
      if (this.params.length > 0) o.forEach(this.params, '<', '>', ',');
      this.SUPER(o);
    },
  ],
});
