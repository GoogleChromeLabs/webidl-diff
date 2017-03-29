// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('StoreAndForwardDAO', function() {
  var FlakyDAO;
  var StoreAndForwardDAO;
  var InternalException;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'StoreAndForwardDAO',
      extends: 'org.chromium.webidl.StoreAndForwardDAO',

      listeners: [
        {
          name: 'onQ',
          isMerged: 'true',
          // Don't wait too long before retrying.
          mergeDelay: 10,
          code: function() { this.forward_(); },
        },
      ],
    });

    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'FlakyDAO',
      extends: 'foam.dao.ProxyDAO',

      requires: [
        'foam.dao.ArrayDAO',
        'foam.dao.InternalException',
      ],

      properties: [
        {
          name: 'delegate',
          factory: function() {
            return this.ArrayDAO.create({of: this.of});
          },
        },
      ],

      methods: [
        function put() { return this.maybe_('put', arguments); },
        function remove() { return this.maybe_('remove', arguments); },
        function find() { return this.maybe_('find', arguments); },
        function select() { return this.maybe_('select', arguments); },
        function removeAll() { return this.maybe_('removeAll', arguments); },

        function maybe_(op, args) {
          return this.shouldSucceed_() ?
              this.delegate[op].apply(this.delegate, args) :
              Promise.reject(this.InternalException.create());
        },
        function shouldSucceed_() { return Math.random() > 0.5; },
      ],
    });

    FlakyDAO = foam.lookup('org.chromium.webidl.test.FlakyDAO');
    StoreAndForwardDAO = foam.lookup('org.chromium.webidl.test.StoreAndForwardDAO');
    InternalException = foam.lookup('foam.dao.InternalException');
  });

  // From node_modules/foam2/test/helpers/generic_dao.js.
  global.genericDAOTestBattery(function(of) {
    return Promise.resolve(StoreAndForwardDAO.create({
      of: of,
      delegate: FlakyDAO.create({
        of: of,
      }),
    }));
  });
});
