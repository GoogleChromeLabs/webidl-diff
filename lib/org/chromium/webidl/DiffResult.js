// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DiffResult',

  properties: [
    {
      class: 'Enum',
      of: 'org.chromium.webidl.WebPlatformEngine',
      name: 'leftSource',
    },
    {
      class: 'Enum',
      of: 'org.chromium.webidl.WebPlatformEngine',
      name: 'rightSource',
    },
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.DiffChunk',
      name: 'chunks',
    },
  ],
});
