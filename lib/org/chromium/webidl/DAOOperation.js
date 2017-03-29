// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'DAOOperation',

  properties: [
    {
      class: 'String',
      documentation: 'DAO method name associated with operation.',
      name: 'methodName',
    },
    {
      documentation: 'Arguments object associated with operation.',
      name: 'args',
    },
    {
      name: 'promise_',
      factory: function() {
        var self = this;
        var resolve;
        var reject;
        var promise = new Promise(function(res, rej) {
          resolve = res;
          reject = rej;
        });
        promise.resolveFunction_ = resolve;
        promise.rejectFunction_ = reject;
        return promise;
      },
    },
    {
      class: 'Function',
      name: 'resolve_',
      factory: function() {
        return this.promise_.resolveFunction_;
      },
    },
    {
      class: 'Function',
      name: 'reject_',
      factory: function() {
        return this.promise_.rejectFunction_;
      },
    },
  ],

  methods: [
    function getPromise() { return this.promise_; },
  ],

  listeners: [
    function resolve() { return this.resolve_.apply(this, arguments); },
    function reject() { return this.reject_.apply(this, arguments); },
  ],
});
