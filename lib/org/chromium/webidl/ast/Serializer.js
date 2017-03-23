// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Serializer',
  extends: 'org.chromium.webidl.ast.MemberData',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Operation',
      name: 'operation',
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.SerializerPattern',
      name: 'pattern',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      o.outputStrs('serializer');
      if (this.operation) o.outputStrs(' ').outputObj(this.operation);
      else if (this.pattern) o.outputStrs(' = ').outputObj(this.pattern);
      o.outputStrs(';');
    },
  ],
});
