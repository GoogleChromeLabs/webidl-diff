// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'RateLimiter',

  documentation: 'A decorator for limiting request rate.',

  imports: ['rateLimiter'],

  properties: [
    {
      class: 'Int',
      name: 'interval',
      documentation: 'Polling interval for dequeuing.',
      value: 50,
      postSet: function(old, nu) {
        if (this.intervalId_ !== null) clearInterval(this.intervalId_);
        this.intervalId_ = setInterval(this.onDequeue, nu);
      },
    },
    {
      class: 'Array',
      of: 'Function',
      name: 'q_',
    },
    {
      documentation: 'Return value from setInterval() used or polling.',
      name: 'intervalId_',
      value: null,
    },
  ],

  methods: [
    function enqueue(f) {
      if (this.intervalId_ === null)
        this.intervalId_ = setInterval(this.onDequeue, this.interval);

      var self = this;
      return new Promise(function(resolve, reject) {
        self.q_.push(function() {
          try {
            resolve(f());
          } catch (error) {
            reject(error);
          }
        });
      });
    },
  ],

  listeners: [
    function onDequeue() {
      var f = this.q_.shift();
      f && f();
      if (this.q_.length === 0) {
        clearInterval(this.intervalId_);
        this.intervalId_ = null;
      }
    },
  ],
});
