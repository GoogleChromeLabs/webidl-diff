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
      factory: function() {
        return null;
      },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Operation',
      name: 'operation',
      factory: function() {
        return null;
      },
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
      if (this.attribute) return this.attribute.getName();
      else if (this.operation) return this.operation.getName();
      else return 'stringifier';
    },
    function outputWebIDL(o) {
      o.outputStrs('stringifier');
      if (this.attribute) o.outputStrs(' ').outputObj(this.attribute);
      else if (this.operation) o.outputStrs(' ').outputObj(this.operation);
      else o.outputStrs(';');
    },
  ],
});
