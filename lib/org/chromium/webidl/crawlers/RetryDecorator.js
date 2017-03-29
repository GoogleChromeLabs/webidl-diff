// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'RetryDecorator',

  documentation: 'A decorator for retrying requests.',

  imports: [
    'error as logError',
    'info as logInfo',
  ],

  properties: [
    {
      class: 'Proxy',
      // TODO(markdittmer): "of" here should be more generic.
      of: 'org.chromium.webidl.crawlers.GitilesRequest',
      name: 'delegate',
      documentation: 'send() implementer to decorate.',
    },
    {
      class: 'Int',
      documentation: 'Pause length before retrying this request.',
      name: 'retryInterval',
      value: 10000,
    },
    {
      class: 'Int',
      documentation: 'Maximum number of retry attempts.',
      name: 'maxRetries',
      value: 5,
    },
    {
      class: 'Int',
      documentation: 'Total queued retries.',
      name: 'retries_',
    },
  ],

  methods: [
    function send() {
      if (!this.delegate)
        throw new Error('Attempt to send() on RetryDecorator with no delegate');
      return this.delegate.send().catch(this.onError);
    },
  ],

  listeners: [
    function onError(error) {
      if (this.retries_ > this.maxRetries) {
        this.logError(`RetryDecorator: Exceeded maximum number of retries
          (${this.delegate.getURL()}).`);
        throw error;
      }

      if (error && error.status === 429) {
        this.logInfo(`RetryDecorator: Server overloaded
          (${this.delegate.getURL()}).
          Trying again in ${this.retryInterval}ms.`);
        this.retries_++;

        var self = this;
        return new Promise(function(resolve) {
          setTimeout(function() { self.send().then(resolve); }, self.retryInterval);
        });
      } else {
        this.logError(`RetryDecorator: Unhandled error: ${error}`);
        throw error;
      }
    },
  ],
});
