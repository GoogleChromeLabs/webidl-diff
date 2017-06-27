// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFileContents',

  documentation: 'An IDL file that stores its contents.',

  requires: [
    'foam.core.Property',
    'foam.net.HTTPrequest',
  ],

  properties: [
    {
      name: 'id',
      factory: function() { return this.metadata.id; },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.IDLFile',
      name: 'metadata',
      required: true,
      final: true,
    },
    {
      class: 'String',
      name: 'contents',
      required: true,
      final: true,
    },
  ],
});
