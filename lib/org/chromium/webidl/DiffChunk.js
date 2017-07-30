// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffChunk',

  ids: [ 'name', 'leftSources', 'rightSources' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true,
    },
    {
      class: 'String',
      name: 'status',
    },
    {
      class: 'String',
      name: 'propPath',
    },
    {
      class: 'String',
      name: 'leftKey',
    },
    {
      class: 'String',
      name: 'rightKey',
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
