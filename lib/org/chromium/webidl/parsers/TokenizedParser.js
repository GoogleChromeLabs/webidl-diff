// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.parsers',
  name: 'TokenizedParser',

  documentation: `A parser that expects a "separator" between its constituent
    parts.`,

  properties: [
    {
      class: 'foam.parse.ParserProperty',
      name: 'separator',
      final: true,
    },
  ],
});
