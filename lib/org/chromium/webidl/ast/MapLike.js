// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'MapLike',
  extends: 'org.chromium.webidl.ast.MemberData',
  implements: [
    'org.chromium.webidl.ast.AttributeLike',
    'org.chromium.webidl.ast.Typed',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Type',
      name: 'valueType',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.isInherited) o.outputStrs('inherited ');
      if (this.isReadOnly) o.outputStrs('readonly ');
      o.outputStrs('maplike')
          .forEach([this.type, this.valueType], '<', '>', ',').outputStrs(';');
    },
  ],
});
