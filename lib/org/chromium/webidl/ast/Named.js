// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Named',

  // Operations nodes implements Named, however, they have optional idenifiers.
  // Thus, id will be null for these nodes!
  ids: ['name'],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.ast.Literal',
      name: 'name',
    },
  ],
});
