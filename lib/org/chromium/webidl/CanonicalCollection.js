// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'CanonicalCollection',

  documentation: `This class facilitates the transport of a collection of
      canonical definition AST nodes from Canonicalizer to the next component.
      The collection also contains information about the source from which the
      definitions came from.

      This class has no ID as the definitions are intended to be unpacked into
      storable definitions.`,

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
