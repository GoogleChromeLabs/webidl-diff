// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Named',

  // The actual literal is stored in name.literal... will this be an issue?
  // Also, Operations nodes are Named... but they have optional identifiers...
  // Thus, name === null for some nodes...
  ids: ['name'],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Literal',
      name: 'name',
    },
  ],
});
