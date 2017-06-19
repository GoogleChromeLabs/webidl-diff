// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICNESE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizeRunner',

  require: ['foam.dao.MDAO'],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.MDAO.create({of: 'org.chromium.webidl.IDLFileContents' });
      },
    },
  ],

  methods: [
    function run(args) {
      var x = args;
    },
  ],
});
