// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'RateLimitDecorator',

  documentation: 'A decorator for limiting request rate.',

  imports: ['rateLimiter'],

  properties: [
    {
      class: 'Proxy',
      // TODO(markdittmer): "of" here should be more generic.
      of: 'org.chromium.webidl.crawlers.GitilesRequest',
      name: 'delegate',
      documentation: 'send() implementer to decorate.',
    },
  ],

  methods: [
    function send() {
      if (!this.delegate)
        throw new Error('Attempt to send() on RateLimitDecorator with no delegate');
      return this.rateLimiter.enqueue(this.delegate.send.bind(this.delegate));
    },
  ],
});
