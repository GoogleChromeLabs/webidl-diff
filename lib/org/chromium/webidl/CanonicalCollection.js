// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalCollection',

  documentation: `A collection of canonical definition AST nodes and
      information about the source from which the definitions came from.`,

  properties: [
    {
      documentation: `A map of Canonical Definitions, where the key
          (type: String) is the name of the Definition and the value
          is a Definition AST node.`,
      name: 'definitions',
      required: true,
    },
    {
      class: 'Enum',
      of: 'org.chromium.webidl.WebPlatformEngine',
      name: 'source',
      required: true,
    },
  ],
});
