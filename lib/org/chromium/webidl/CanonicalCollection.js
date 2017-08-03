// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalCollection',

  properties: [
    {
      documentation: `A map of Canonical Definitions, where the key is a string
          and the value is a Definition AST node.`,
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
