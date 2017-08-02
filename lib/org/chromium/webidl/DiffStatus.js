// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'DiffStatus',

  values: [
    {
      name: 'MISSING_DEFINITION',
      label: 'Definition not found for one of the sources.',
    },
    {
      name: 'VALUES_DIFFER',
      label: 'Values differ.'
    },
    {
      name: 'NO_MATCH_ON_LEFT',
      label: 'No match found on the left side.',
    },
    {
      name: 'NO_MATCH_ON_RIGHT',
      label: 'No match found on the right side.',
    },
  ],
});
