// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'ExtendedAttribute',

  imports: [ 'source? as ctxSource' ],

  properties: [
    {
      name: 'source',
    },
  ],

  methods: [
    function init() {
      this.source = this.ctxSource;
    },
  ],
});
