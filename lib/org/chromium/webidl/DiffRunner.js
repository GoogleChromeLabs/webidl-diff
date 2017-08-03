// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.Diff'],

  documentation: `Runnable box that performs diff between definitions
    from different sources.`,

  properties: [
    {
      documentation: `Stores all canonical definitions that have been
        sent to this component.`,
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
      if (!source || !canonical) {
        this.error(this.fmtErrorMsg(
            'Missing source or canonicalMap from message object!'));
        return;
      }

      // Store the canonical data into a map.
      this.sourceMap_[source] = canonical;

      // Trigger a diff with all other maps that currently exist.
      for (var key in this.sourceMap_) {
        if (!this.sourceMap_.hasOwnProperty(key) || key === source.name)
          continue;

        // FUTURE: Spawn a worker to perform diff.
        var results = this.Diff.create().diff(canonical, this.sourceMap_[key]);
        var msg = this.PipelineMessage.create({
          leftSource: source,
          rightSource: key,
          diffChunks: results,
        });
        this.output(msg);
      }
    },
  ],
});
