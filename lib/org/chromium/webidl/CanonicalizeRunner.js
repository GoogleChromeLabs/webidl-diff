// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizeRunner',
  extends: 'foam.box.Runnable',

  requires: [
    'foam.dao.MDAO',
    'org.chromium.webidl.ast.Enum',
    'org.chromium.webidl.ast.Typedef',
  ],

  properties: [
    {
      name: 'Definitions',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Definition' });
      },
    }
  ],

  methods: [
    function run(args) {
      var self = this;
      var asts = args.ast;
      var file = args.file;

      asts.forEach(function(ast) {
        var def = ast.definition;
        if (self.Enum.isInstance(def) || self.Typedef.isInstance(def)) return;

        self.Definitions.find(ast.id)
          .then(function(result) {
            var clone = ast.clone();
            if (result === null) {
              // Place clone of AST into DAO as canonical AST
              self.Definitions.put(clone);
            } else {
              var canonicalPartial = result.definition.isPartial;
              var defPartial = def.isPartial;

              if (!canonicalPartial && !defPartial) {
                throw new Error("Two non-partial fragments were found for same interface!");
              }

              // Copy all members from current item into canonical AST
              result.definition.members.concat(clone.definition.members);

              // Update AST partial status if required
              if (!defPartial) {
                result.definition.isPartial = false;
              }
              self.Definitions.put(result);
            }
          });
      });
    },
  ],
});
