// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'RetryDecorator',

  documentation: 'A decorator for retrying requests.',

  requires: [
    'foam.net.HTTPRequest',
    'org.chromium.webidl.crawlers.GitilesRequestType',
  ],
  imports: [
    'error as logError',
    'info as logInfo',
  ],

  topics: [
    'complete',
    'error',
  ],

  properties: [
    {
      class: 'Proxy',
      name: 'delegate',
      topics: [
        'complete',
        'error',
      ],
      documentation: `send() implementer that publishes "error" and "complete"
        topics.`,
    },
    {
      class: 'Int',
      documentation: 'Pause length before retrying this request.',
      name: 'retryInterval',
      value: 5000,
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
    {
      documentation: 'Subscription object listening to delegate "complete".',
      name: 'completeSub_',
      value: null,
    },
    {
      documentation: 'Subscription object listening to delegate "error".',
      name: 'errorSub_',
      value: null,
    },
  ],

  methods: [
    function send() {
      if (!this.delegate)
        throw new Error('Attempt to send() on RetryDecorator with no delegate');
      if (this.completeSub_ || this.errorSub_)
        throw new Error('Attempt to send() on busy RetryDecorator');

      this.completeSub_ = this.delegate.complete.sub(this.onComplete);
      this.errorSub_ = this.delegate.error.sub(this.onError);
      this.onSend();
    },
    function detach() {
      this.completeSub_.detach();
      this.errorSub_.detach();
      this.completeSub_ = this.errorSub_ = null;
    },
  ],

  listeners: [
    function onSend() {
      this.delegate.send();
    },
    function onComplete() {
      this.detach();
    },
    function onError(_, __, error) {
      if (error && error.status === 429) {
        this.logInfo(`RetryDecorator: Server overloaded
          (${this.delegate.getURL()}).
          Trying again in${this.retryInterval}ms.`);
        this.retries_++;
        setTimeout(this.onSend, this.retryInterval);
      } else {
        this.logError(`RetryDecorator: Unhandled error: ${error}`);
        throw error;
      }
    },
  ],
});
