// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Canonicalizer',

  requires: [
    'foam.dao.MDAO',
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
        IDL files. Default value is set at 5 minutes (300 ms).`,
      name: 'waitTime',
      value: 300,
    },
    {
      documentation: `A map of DAOs containing canonical IDL files. The
        key of the map corresponds to the renderer (source) from which the
        files were extract. For example, DAOMap['blink'] is a DAO that
        contains the canonical IDL files from the Blink repo.`,
      name: 'DAOMap_',
      factory: function() { return {}; },
    },
    {
      documentation: 'Used to generate DAOs for DAOMap',
      name: 'DAOFactory_',
      value: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Definition' });
      },
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
        // Determine if DAO exists for this source. Create one if non-existent.
        var definitionDAO = this.DAOMap_[source];
        if (!definitionDAO) {
          definitionDAO = this.DAOFactory_();
          this.DAOMap_[source] = definitionDAO;
        }

        var def = ast.definition;
        if (!def)
          return '???';

        // Ignore definition if Enum or Typedef.
        if (this.Enum.isInstance(def) || this.Typedef.isInstance(def)) return;

        // Find any existing interface with same id (name).
        definitionDAO.find(ast.id).then(function(result) {
          var clone = ast.clone();

          if (result === null) {
            // No interface with the same name was found.
            // We add a copy of ourselves into the DAO.
            clone.ref = [metadata];
            definitionDAO.put(clone);
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

            // Copy all members from incoming definition into canonical AST.
            result.definition.members.concat(clone.definition.members);
            result.ref.push(metadata);

            // Update AST partial status if required.
            if (!defPartial) {
              result.definition.isPartial = false;
            }
            definitionDAO.put(result);
          }
          this.resetTimer(source);
        }.bind(this));
      },
    },
    {
      documentation: `Called after performing addFragments to reset the timer.`,
      name: 'resetTimer',
      code: function(source) {
        // Clear previous timer if it exists.
        if (this.timerMap_[source]) clearTimeout(this.timerMap_[source]);
        this.timerMap_[source] = setTimeout(function() {
          this.definitionDAO[source].select().then(function(results) {
            this.done(results);
          }.bind(this));
        }.bind(this), this.waitTime * 1000);
      },
    },
  ],
});
