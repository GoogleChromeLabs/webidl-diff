// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Canonicalizer',

  documentation: `This component expects to receive AST nodes from various
    sources. Canonical versions of interface definitions will be created
    from AST nodes of the same source.
    Please note that this step cannot be distributed. All computations
    must be done through one canonicalizer instances, or you will
    get fragmented results.`,

  requires: [
    'org.chromium.webidl.ast.Enum',
    'org.chromium.webidl.ast.Typedef',
    'org.chromium.webidl.PipelineMessage',
  ],

  properties: [
    {
      class: 'Function',
      documentation: `Function is called after waitTime seconds has passed
        since the last call to addFragment.`,
      name: 'done',
      required: true,
    },
    {
      class: 'Int',
      documentation: `The amount of time to wait in seconds after the last
        addFragment request, before done() is called with the canonical
        IDL files.`,
      name: 'waitTime',
    },
    {
      documentation: `A map of maps containing canonical IDL files. The
        key of the map corresponds to the renderer (source) from which the
        files were extract. For example, DAOMap['blink'] is a DAO that
        contains the canonical IDL files from the Blink repo.`,
      name: 'rendererMap_',
      factory: function() { return {}; },
    },
    {
      documentation: `A map of Timers that is used to determine whether waitTime
        has passed since the last call to addFragment.`,
      name: 'timerMap_',
      factory: function() { return {}; },
    },
  ],

  methods: [
    {
      documentation: `Takes a given AST and extracts the definition members
        from the AST. The members are then placed into the DAO corresponding to
        the given source and interface.`,
      name: 'addFragment',
      code: function(source, ast, metadata) {
        // Determine if Map exists for this source. Create one if non-existent.
        var map = this.rendererMap_[source];
        if (!map) {
          map = {};
          this.rendererMap_[source] = map;
        }

        var def = ast.definition;
        // Ignore definition if Enum or Typedef.
        if (this.Enum.isInstance(def) || this.Typedef.isInstance(def)) return;

        // Find any existing interface with same id (name).
        var clone = ast.clone();
        var result = map[ast.id];

        if (!result) {
          // No interface with the same name was found.
          // We add a copy of ourselves into the DAO.
          clone.ref = [metadata];
          map[ast.id] = clone;
        } else {
          // An interface with the same name was found.
          var isCanonicalPartial = result.definition.isPartial;
          var isDefPartial = def.isPartial;

          // Determine if we have multiple non-partial fragments.
          if (!isCanonicalPartial && !isDefPartial) {
            console.error(`Two non-partial fragments!
              In DAO: ${result.ref},
              Current: ${metadata}`);
            throw new Error('Two non-partial fragments were found for the same interface!');
          }

          // Copy attributes and members from definition into canonical AST.
          result.attrs = result.attrs.concat(clone.attrs);
          result.definition.members = result.definition.members
            .concat(clone.definition.members);
          result.ref.push(metadata);

          // Copy over inheritance information.
          if (!result.definition.inheritsFrom)
            result.definition.inheritsFrom = clone.definition.inheritsFrom;

          // Update AST partial status if required.
          if (!isDefPartial) {
            result.definition.isPartial = false;
          }
        }
        this.resetTimer(source);
      },
    },
    {
      documentation: `Called after performing addFragments to reset the timer.`,
      name: 'resetTimer',
      code: function(source) {
        // Clear previous timer if it exists.
        if (this.timerMap_[source]) clearTimeout(this.timerMap_[source]);
        this.timerMap_[source] = setTimeout(function() {
          var map = this.rendererMap_[source];
          var results = [];
          for (var key in map) {
            results.push(map[key]);
          }
          this.done(results);
        }.bind(this), this.waitTime * 1000);
      },
    },
  ],
});
