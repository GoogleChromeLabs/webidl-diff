// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLSpecFile',

  documentation: 'An IDL fragment from a spec file.',

  properties: [
    {
      name: 'id',
      factory: function() { return this.metadata.id; },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.HTMLFileContents',
      name: 'metadata',
      required: true,
    },
    {
      class: 'String',
      name: 'contents',
      required: true,
    },
  ],
});
