// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLSpecFile',
  extends: 'org.chromium.webidl.BaseIDLFile',

  documentation: 'An IDL file from a Specification.',

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
  ],
});
