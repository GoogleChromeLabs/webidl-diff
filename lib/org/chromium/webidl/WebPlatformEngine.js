// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'WebPlatformEngine',
  values: [
    {
      name: 'BLINK',
      label: 'Blink',
    },
    {
      name: 'GECKO',
      label: 'Gecko',
    },
    {
      name: 'WEBKIT',
      label: 'WebKit',
    },
    {
      name: 'SPECIFICATION',
      label: 'WebSpec',
    },
  ],
});
