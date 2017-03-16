// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Argument',
  implements: [
    'org.chromium.webidl.ast.Attributed',
    'org.chromium.webidl.ast.Typed',
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Defaulted',
  ],

  documentation: 'AST node for an argument (i.e., parameter) of an operation.',

  properties: [
    {
      class: 'Boolean',
      name: 'isOptional',
    },
    {
      class: 'Boolean',
      name: 'isVariadic',
    },
  ],

  methods: [
    function outputWebIDL(o) {
      if (this.attrs.length > 0)
        o.forEach(this.attrs, '[', ']', ',').newline().indent();
      if (this.isOptional) o.out('optional ');
      o.output(this.type);
      if (this.isVariadic) o.out('... ');
      else o.out(' ');
      o.output(this.name);
      if (this.value) o.out(' = ').output(this.value);
    },
  ],
});
