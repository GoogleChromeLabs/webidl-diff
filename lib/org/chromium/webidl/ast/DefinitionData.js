// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'DefinitionData',

  properties: [
    {
      class: 'Boolean',
      documentation: `If the value is set to false, the AST node represents
        a concrete definition. Otherwise, the AST node represents a canonical
        definition.`,
      name: 'isCanonical',
    },
    {
      class: 'Boolean',
      documentation: `If isCanonical is false, then isPartial signifies whether
        the definition is a partial or non-partial fragment.

        If isCanonical is true, isPartial signifies whether we have merged in a
        non-partial definition. isPartial is set to false if a non-partial
        definition has been merged in. Otherwise, the value is set to true.`,
      name: 'isPartial',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.isPartial) o.outputStrs('partial ');
    },
  ],
});
