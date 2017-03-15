// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl.ast',
  name: 'OperationQualifier',
  values: [
    {
      name: 'GETTER',
      label: 'getter',
    },
    {
      name: 'SETTER',
      label: 'setter',
    },
    {
      name: 'DELETER',
      label: 'deleter',
    },
    {
      name: 'LEGACY_CALLER',
      label: 'legacycaller',
    },
    {
      name: 'CREATOR',
      label: 'creator',
    },
  ],
});
