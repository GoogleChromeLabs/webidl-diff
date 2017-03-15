// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Attributed',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.ast.ExtendedAttribute',
      name: 'attrs',
      adapt: function(_, attrs) {
        return attrs.sort(foam.util.compare);
      },
    },
  ],
});
