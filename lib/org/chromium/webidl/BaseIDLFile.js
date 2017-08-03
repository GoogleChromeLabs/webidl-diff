// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'BaseIDLFile',

  documentation: 'Serves as the base class of IDL file classes.',

  properties: [
    {
      class: 'String',
      name: 'contents',
      required: true,
    },
  ],
});
