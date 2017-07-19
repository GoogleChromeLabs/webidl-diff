// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'PipelineRunner',
  extends: 'foam.box.Runnable',

  requires: ['org.chromium.webidl.PipelineMessage'],

  constants: {
    INVALID_ARG: `run() expects a PipelineMessage object!`,
  },

  methods: [
    function run(message) {
      if (!this.PipelineMessage.isInstance(message))
        return this.error(new Error(`${this.cls_name}: ${this.INVALID_ARG}`));
    },
  ],
});
