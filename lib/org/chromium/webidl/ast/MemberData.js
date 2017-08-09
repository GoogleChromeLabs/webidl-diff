// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'MemberData',

  properties: [
    {
      class: 'Boolean',
      documentation: `If the value is set to false, the member is not a
          static definition. Otherwise, the definition is static.`,
      name: 'isStatic',
    },
  ],
});
