// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Canonicalizer',

  documentation: `This component expects to receive AST nodes from different
    web platform rendering engines. Canonical versions of definitions will
    be created from AST nodes of the same engine.

    Please note that canonicalization for same IDL fragment repository cannot
    be distributed. All computations for the same repository must be done
    through one canonicalizer instances, or you will get fragmented results.`,

  requires: [
    'org.chromium.webidl.ast.Enum',
    'org.chromium.webidl.ast.Typedef',
    'org.chromium.webidl.PipelineMessage',
  ],

  imports: [ 'error' ],

  properties: [
    // TODO: This component should not be responsible for observing the
    // pipeline. onDone and waitTime should be removed in the futute and
    // replaced with a subscription to a component that is responsible for
    // observing the pipeline.
    {
      class: 'Function',
      documentation: `Function is called after waitTime seconds has passed
        since the last call to addFragment. We currently have no way of
        determining when the Canonicalizer is finished receiving fragments.
        It is assumed that if waitTime has passed and no new fragments are
        received, then it will not receive any more fragments.`,
      name: 'onDone',
      required: true,
    },
    {
      class: 'Int',
      documentation: `The amount of time to wait in seconds after the last
        addFragment request, before onDone() is called with the canonical
        IDL files.`,
      name: 'waitTime',
    },
    {
      documentation: `A map of Timers that is used to determine whether waitTime
        has passed since the last call to addFragment.`,
      name: 'timerMap_',
      factory: function() { return {}; },
    },
    {
      documentation: `A map of maps containing canonical IDL files. The
        key of the map corresponds to the repository (source) from which the
        files were extract. For example, sourceMap_[WebPlatformEngine.BLINK] is
        a map that contains the canonical IDL files from the Blink repo.`,
      name: 'sourceMap_',
      factory: function() { return {}; },
    },
  ],

  methods: [
    {
      documentation: `Takes a given AST and extracts the definition members
        from the AST. The members are then placed into the map corresponding to
        the given source and interface.`,
      name: 'addFragment',
      code: function(engine, ast, metadata) {
        // Determine if Map exists for this source. Create one if non-existent.
        var map = this.sourceMap_[engine] = this.sourceMap_[engine] || {};
        var def = ast.definition;

        // Find any existing interface with same id (name).
        var clone = ast.clone();
        foam.assert(ast.id);
        var result = map[ast.id];

        if (!result) {
          // No interface with the same name was found.
          // We add a copy of ourselves into the map.
          clone.definition.isCanonical = true;
          map[ast.id] = clone;
        } else if (this.Enum.isInstance(def) || this.Typedef.isInstance(def)) {
          // An Enum or Typedef with the same name was previously defined!
          console.warn(`Canonicalizer: Encountered two definitions of type` +
              ` Enum or Typedef with the same name ${ast.id}`);

          // Convert entry into array if it is a node, and push both items on.
          if (!Array.isArray(result))
            map[ast.id] = [result];
          map[ast.id].push(clone);
        } else {
          // An interface with the same name was found.
          var isCanonicalPartial = result.definition.isPartial;
          var isDefPartial = def.isPartial;

          // Determine if we have multiple non-partial fragments.
          if (!isCanonicalPartial && !isDefPartial) {
            this.error(`Canonicalizer: Two non-partial fragments!
              In Map: ${foam.json.Pretty.stringify(result.ref)},
              Current: ${foam.json.Pretty.stringify(metadata)}`);
            throw new Error(`Canonicalizer: Two non-partial fragments were ` +
                `found for the same interface (${ast.id})!}`);
          }

          // Copy attributes and members from definition into canonical AST.
          result.attrs = result.attrs.concat(clone.attrs);
          result.definition.members = result.definition.members
              .concat(clone.definition.members);

          // Copy over inheritance information.
          if (!result.definition.inheritsFrom)
            result.definition.inheritsFrom = clone.definition.inheritsFrom;

          // Update AST partial status if required.
          if (!isDefPartial) {
            result.definition.isPartial = false;
          }

          // Update Canonical sources (at the Definition level).
          result.source.push(clone.source);
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
          var map = this.sourceMap_[source];
          var results = [];
          for (var key in map) {
            if (map.hasOwnProperty(key))
              results.push(map[key]);
          }
          this.onDone(results);
        }.bind(this), this.waitTime * 1000);
      },
    },
  ],
});
