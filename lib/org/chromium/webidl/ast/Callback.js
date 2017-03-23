// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Callback',
  extends: 'org.chromium.webidl.ast.DefinitionData',
  implements: [
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Returner',
    'org.chromium.webidl.ast.Parameterized',
  ],

  methods: [
    function outputWebIDL(o) {
      this.SUPER(o);
      o.outputStrs('callback ').outputObj(this.name).outputStrs(' = ')
          .outputObj(this.returnType).forEach(this.args, '(', ')', ',')
          .outputStrs(';');
    },
  ],
});
