// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'HTMLFileContents',

  documentation: 'An HTML file that stores the raw content of the response.',

  ids: ['url', 'timestamp'],

  properties: [
    {
      class: 'String',
      name: 'url',
      required: true,
    },
    {
      class: 'Date',
      name: 'timestamp',
      required: true,
    },
    {
      class: 'String',
      name: 'contents',
    },
  ],
});
