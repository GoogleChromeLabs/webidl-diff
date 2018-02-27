// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFileContents',
  extends: 'org.chromium.webidl.BaseIDLFile',

  documentation: 'An IDL file that stores its contents.',

  properties: [
    {
      name: 'id',
      factory: function() { return this.metadata.id; },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.IDLFile',
      name: 'metadata',
      value: null,
    },
    {
      class: 'Array',
      of: 'String',
      documentation: 'An array of spec URLs present within this file.',
      name: 'specUrls',
    },
  ],
});
