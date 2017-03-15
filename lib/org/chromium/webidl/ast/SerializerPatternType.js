// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl.ast',
  name: 'SerializerPatternType',

  values: [
    {
      name: 'ARRAY',
      label: 'Array',
    },
    {
      name: 'MAP',
      label: 'Map',
    },
    {
      name: 'IDENTIFIER',
      label: 'Identifier',
    },
  ],
});
