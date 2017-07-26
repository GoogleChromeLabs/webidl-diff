// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Attribute',
  extends: 'org.chromium.webidl.ast.MemberData',
  implements: [
    'org.chromium.webidl.ast.AttributeLike',
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Typed',
  ],

  imports: [ 'source? as ctxSource' ],

  properties: [
    {
      name: 'source',
    },
  ],

  methods: [
    function init() {
      this.source = this.ctxSource;;
    },
    function outputWebIDL(o) {
      if (this.isInherited) o.outputStrs('inherit ');
      if (this.isReadOnly) o.outputStrs('readonly ');
      o.outputStrs('attribute ').outputObj(this.type).outputStrs(' ')
          .outputObj(this.name).outputStrs(';');
    },
  ],
});
