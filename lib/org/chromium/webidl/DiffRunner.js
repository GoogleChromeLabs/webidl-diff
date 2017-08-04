// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: [
    'org.chromium.webidl.CanonicalCollection',
    'org.chromium.webidl.Diff',
    'org.chromium.webidl.DiffResult',
  ],

  documentation: `Runnable box that performs diff between definitions
    from different sources.`,

  properties: [
    {
      class: 'String',
      name: 'ioRelationshipType',
      documentation: 'The n:m relationship type of input-to-output.',
      value: 'many:many',
    },
    {
      class: 'Class',
      documentation: 'Type of input parameter of run().',
      name: 'inputType',
      factory: function() {
        return this.CanonicalCollection;
      },
    },
    {
      class: 'Class',
      documentation: 'Type of output values produced by run().',
      name: 'outputType',
      factory: function() {
        return this.DiffResult;
      },
    },
    {
      documentation: `Stores all canonical definitions that have been
        sent to this component.`,
      name: 'sourceMap_',
      factory: function() { return {}; },
    },
  ],

  methods: [
    function run(collection) {
      if (this.validateMessage(collection)) return;

      var source = collection.source;
      var canonical = collection.definitions;

      // Store the canonical data into a map.
      this.sourceMap_[source] = canonical;

      // Trigger a diff with all other maps that currently exist.
      for (var key in this.sourceMap_) {
        if (!this.sourceMap_.hasOwnProperty(key) || key === source.name)
          continue;

        var results = this.Diff.create().diff(canonical, this.sourceMap_[key]);
        var msg = this.DiffResult.create({
          leftSource: source,
          rightSource: key,
          chunks: results,
        });
        console.log(msg);
        //this.output(msg);
      }
    },
  ],
});
