// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Type',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.TypeSuffix',
      name: 'suffixes',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      for (var i = 0; i < this.suffixes.length; i++) {
        o.outputStrs(this.suffixes[i].label);
      }
    },
  ],
});
