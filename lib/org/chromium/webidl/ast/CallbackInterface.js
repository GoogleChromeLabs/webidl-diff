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
      name: 'interface',
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
      return this.interface.getName();
    },
    function outputWebIDL(o) {
      this.SUPER(o);
      o.outputStrs('callback ').outputObj(this.interface);
    },
  ],
});
