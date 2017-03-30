// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'StoreAndForwardDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Store-and-forward (i.e., store-and-retry) failed DAO
    operations. Useful for DAOs that may flake, but eventually succeed.`,


  requires: [
    'foam.dao.InternalException',
    'org.chromium.webidl.DAOOperation',
  ],

  properties: [
    {
      class: 'Function',
      documentation: `Determine whether or not an error is sufficiently internal
        to the DAO that it's worth retrying the operation that yeilded the
        error. Default is to retry foam.dao.InternalException errors.`,
      name: 'shouldRetry',
      // TODO(markdittmer): These should be supported by function properties,
      // but they're not.
      /*
      returns: {
        documentation: 'Indicator: Should this error be retried?',
        typeName: 'Boolean',
      },
      args: [
        {
          documentation: 'The error thrown by the delegate DAO.',
          name: 'error',
          typeName: 'Error',
        },
      ],
      */
      value: function(error) {
        return this.InternalException.isInstance(error);
      },
    },
    {
      class: 'Array',
      of: 'org.chromium.webidl.DAOOperation',
      documentation: 'Queue for incomplete DAO operations.',
      name: 'q_',
    },
    {
      class: 'Boolean',
      name: 'isForwarding_',
    },
  ],

  methods: [
    function put() { return this.store_('put', arguments); },
    function remove() { return this.store_('remove', arguments); },
    function find() { return this.store_('find', arguments); },
    function select() { return this.store_('select', arguments); },
    function removeAll() { return this.store_('removeAll', arguments); },

    function store_(methodName, args) {
      // Store DAO operations in order.
      var op = this.DAOOperation.create({
        methodName: methodName,
        args: args,
      });
      this.q_.push(op);
      // If no forwarding in progress then forward this op immediately.
      // Otherwise, in-progress forwarding will get to it eventually.
      if (!this.isForwarding_) this.forward_();
      // Return Promise associated with completing operation.
      return op.getPromise();
    },
    function forward_() {
      // Guard against attempt to flush empty queue.
      if (this.q_.length === 0) {
        this.isForwarding_ = false;
        return;
      }

      this.isForwarding_ = true;

      var op = this.q_[0];
      this.delegate[op.methodName].apply(this.delegate, op.args)
          .then(this.onComplete.bind(this, op))
          .catch(this.onError.bind(this, op));
    },
  ],

  listeners: [
    {
      name: 'onQ',
      documentation: `Attempt to forward failed operations no more frequently
        than "mergeDelay"ms.`,
      isMerged: 'true',
      mergeDelay: 2000,
      code: function() {
        this.forward_();
      },
    },
    {
      name: 'onComplete',
      documentation: `Operation, "op", just completed successfully, yielding
        "result". Since order is presvered, "op" is at the head of "q_".
        Dequeue "op" and resolve its promise.`,
      code: function(op, result) {
        // Dequeue and resolve completed op; attempt to forward next op.
        this.q_.shift();
        op.resolve(result);
        this.forward_();
      },
    },
    {
      name: 'onError',
      documentation: `Operation, "op", failed, yielding "error". If it should be
        retried, tickle merged listener "onQ" to ensure that it is tried again
        later. Otherwise, discard it from "q_" and reject its promise.`,
      code: function(op, error) {
        // Trigger merged listener to initiate another forwarding attempt.
        if (this.shouldRetry(error)) {
          this.isForwarding_ = false;
          this.onQ();
          return;
        }

        // Thrown error not retryable:
        // Dequeue and reject op; attempt to forward next op.
        this.q_.shift();
        op.reject(error);
        this.forward_();
      },
    },
  ],
});
