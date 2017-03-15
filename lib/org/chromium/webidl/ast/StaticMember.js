// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'StaticMember',
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
    function compareTo(other) {
      if (!this.cls_.isInstance(other)) return this.SUPER(other);

      return foam.util.compare(
        this.attribute || this.operation,
        other.attribute || other.operation
      );
    },
    function outputWebIDL(o) {
      o.out('static ');
      if (this.attribute)
        o.output(this.attribute);
      else
        o.output(this.operation);
    },
  ],
});
