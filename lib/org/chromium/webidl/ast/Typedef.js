// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Typedef',
  extends: 'org.chromium.webidl.ast.DefinitionData',
  implements: [
    'org.chromium.webidl.ast.Named',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Type',
      name: 'type',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      this.SUPER(o);
      o.out('typedef ').output(this.type).out(' ').output(this.name).out(';');
    },
  ],
});
