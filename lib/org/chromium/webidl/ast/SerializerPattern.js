// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'SerializerPattern',
  requires: [
    'org.chromium.webidl.ast.SerializerPatternType',
  ],

  properties: [
    {
      class: 'Enum',
      of: 'org.chromium.webidl.ast.SerializerPatternType',
      name: 'type',
    },
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.Literal',
      name: 'parts',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.type === this.SerializerPatternType.IDENTIFIER) {
        o.outputStrs(this.parts[0]);
      } else if (this.type === this.SerializerPatternType.MAP) {
        o.forEach(this.parts, '{', '}', ',');
      } else if (this.type === this.SerializerPatternType.ARRAY) {
        o.forEach(this.parts, '[', ']', ',');
      }
    },
  ],
});
