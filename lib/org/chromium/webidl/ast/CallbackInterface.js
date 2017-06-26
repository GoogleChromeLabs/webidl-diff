// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'CallbackInterface',
  extends: 'org.chromium.webidl.ast.DefinitionData',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Interface',
      name: 'interfaceDetail',
    },
    {
      name: 'id',
      expression: function(interfaceDetail) {
        return interfaceDetail.id;
      },
    }
  ],

  methods: [
    function outputWebIDL(o) {
      this.SUPER(o);
      o.outputStrs('callback ').outputObj(this.interfaceDetail);
    },
  ],
});
