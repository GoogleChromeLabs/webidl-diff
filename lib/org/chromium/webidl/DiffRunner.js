// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  documentation: 'Runnable box that performs diff between definitions from different sources',

  properties: [
    {
      documentation: '...',
      name: 'sourceMap_',
      factory: function() { return {}; },
    },
  ],

  methods: [
    function run(message) {
      if (this.validateMessage(message)) return;

      // Verify all required arguments are present.
      var source = message.source;
      var canonical = message.canonicalMap;
      if (!source || !canonicalMap)
        this.error(this.fmtErrorMsg('Missing source or canonicalMap from message object!'));

      // Store the canonical data into a map.
      this.sourceMap_[source] = canonicalMap;

      // Trigger a diff with all other maps that currently exist.
      for (var key in this.sourceMap_) {
        if (key === source) continue;

        // Otherwise, call diff!
      }
    },
  ],
});
