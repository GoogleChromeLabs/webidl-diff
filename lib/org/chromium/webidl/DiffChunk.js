// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffChunk',

  ids: [ 'definitionName', 'leftSources', 'rightSources' ],

  properties: [
    {
      class: 'String',
      name: 'definitionName',
      required: true,
    },
    {
      class: 'Enum',
      of: 'org.chromium.webidl.DiffStatus',
      name: 'status',
    },
    {
      class: 'String',
      name: 'propPath',
    },
    {
      name: 'leftValue',
    },
    {
      name: 'rightValue',
    },
    {
      class: 'Array',
      of: 'String',
      name: 'leftSources',
    },
    {
      class: 'Array',
      of: 'String',
      name: 'rightSources',
    },
  ],
});
