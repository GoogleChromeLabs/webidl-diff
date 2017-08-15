// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'JournalingContainer',

  documentation: 'Provides a DAO which allows data to be persisted in a file.',

  requires: [
    'foam.dao.JDAO',
    'foam.dao.NullDAO',
    'foam.dao.NodeFileJournal',
  ],

  exports: ['getDAO'],

  properties: [
    {
      class: 'String',
      documentation: 'The directory where all journals should be placed.',
      name: 'outputDir',
      required: true,
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
    {
      name: 'path_',
      factory: function() { return require('path'); },
    },
  ],

  methods: [
    function getDAO(cls, name) {
      var self = this;
      return this.JDAO.create({
        delegate: self.NullDAO.create({of: cls}),
        journal: self.NodeFileJournal.create({
          fd: self.fs_.openSync(
              self.path_.resolve(this.outputDir, `${name}-journal.js`),
              'w+'),
        }),
      });
    },
  ],
});
