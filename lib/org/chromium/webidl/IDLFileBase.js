// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFileBase',

  documentation: 'Basic data associated with an IDL file.',

  ids: ['repository', 'revision', 'path'],

  properties: [
    {
      class: 'String',
      name: 'repository',
      final: true,
      required: true,
    },
    {
      class: 'String',
      name: 'revision',
      final: true,
      required: true,
    },
    {
      class: 'String',
      name: 'path',
      final: true,
      required: true,
    },
    {
      class: 'String',
      name: 'rawURL',
      final: true,
      required: true,
    },
    {
      class: 'String',
      name: 'documentURL',
      final: true,
    },
  ],
});
