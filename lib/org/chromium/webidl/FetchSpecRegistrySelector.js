// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRegistrySelector',
  implements: [
    'foam.box.RegistrySelector',
    'foam.core.StubFactory',
  ],

  requires: [
    'foam.box.BoxRegistry',
    'foam.box.Context',
    'foam.box.node.ForkBox',
  ],

  properties: [
    {
      name: 'defaultRegistry',
      documentation: 'Registry for everything other than FetchSpecRunners.',
      factory: function() { return this.Context.create().registry; }
    },
    {
      name: 'fetchRegistry',
      documentation: 'Registry used for FetchSpecRunners.',
      factory: function() {
        // Use defaultRegistry as context to ensure a common foam.box.Context
        // namespace for all pipeline steps.
        return this.get(this.BoxRegistry).create({
          delegate: this.ForkBox.create({
            childScriptPath: require('path')
                .resolve(`${__dirname}/../../../../main/forkScript.js`)
          }, this.defaultRegistry),
        }, this.defaultRegistry);
      },
    },
  ],

  methods: [
    function select(name, service, box) {
      // TODO: Replace with a more explicit strategy for identifying box
      // registrations that require special treatment.
      if (box && box.data && box.data.cls_ &&
          box.data.cls_.id === 'org.chromium.webidl.FetchSpecRunner') {
        return this.fetchRegistry;
      }

      return this.defaultRegistry;
    },
  ],
});
