// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICNESE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalizeRunner',
  extends: 'foam.box.Runnable',

  requires: ['foam.dao.MDAO'],

  properties: [
    {
      name: 'CallbackDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Callback' });
      },
    },
    {
      name: 'InterfaceDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Interface' });
      },
    },
    {
      name: 'NamespaceDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Namespace' });
      },
    },
    {
      name: 'DictionaryDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Dictionary' });
      },
    },
    {
      name: 'EnumDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Enum' });
      },
    },
    {
      name: 'TypedefDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Typedef' });
      },
    },
    {
      name: 'ImplementsDAO',
      factory: function() {
        return this.MDAO.create({ of: 'org.chromium.webidl.ast.Implements' });
      },
      //maybe not needed...
    }
  ],

  methods: [
    function run(args) {
      var self = this;
      var asts = args.ast;
      var file = args.file;

      asts.forEach(function(ast) {
        var name = ast.definition.name.literal;
        self.InterfaceDAO.find(name)
          .then(function(result) {
            if (result === null) {
              ast.id = name;
              self.InterfaceDAO.put(ast);
            } else {
              var y = x;
            }
          });
      });
    },
  ],
});
