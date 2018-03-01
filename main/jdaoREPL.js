// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Script hacked together to load raw data for exploration in a REPL.

var path = require('path');

require('foam2');

// Use config/files.js to determine what order to load code in.
var rootDir = path.resolve(__dirname, '..');
require(path.resolve(rootDir, 'config', 'files.js'));
var files = global.WEB_IDL_DIFF_FILES.slice();
for (var i = 0; i < files.length; i++) {
  require(path.resolve(rootDir, files[i]));
}

// Collect JDAOs from pipeline.
var daos = global.daos = {};
[
  'CanonicalizerRunner-Blink',
  'CanonicalizerRunner-Gecko',
  'CanonicalizerRunner-WebKit',
  'CanonicalizerRunner-WebSpec',
  'DiffRunner',
  'IDLFragmentExtractorRunner-WebSpec',
  'LocalGitRunner-Blink',
  'LocalGitRunner-Gecko',
  'LocalGitRunner-WebKit',
  'ParserRunner-Blink',
  'ParserRunner-Gecko',
  'ParserRunner-WebKit',
  'ParserRunner-WebSpec',
].forEach(journalPrefix => {
  const name = journalPrefix.replace(/-/g, '');
  daos[name] = foam.dao.JDAO.create({
    of: foam.core.FObject,
    delegate: foam.dao.ArrayDAO.create(),
    journal: foam.dao.NodeFileJournal.create({
      fd: require('fs').openSync(`./data/${journalPrefix}-journal.js`, 'r'),
    }),
  });
});

let promises = [];
for (const name in daos) {
  const dao = daos[name];
  promises.push(dao.limit(1).select(foam.dao.QuickSink.create({
    putFn: obj => dao.of = obj.cls_,
  })));
}
// Don't expect data to be available until "DATA LOADED" is logged.
Promise.all(promises).then(() => console.log('DATA LOADED'));
