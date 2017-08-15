// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('JournalingContainer', function() {
  var DummyClass;
  var execSync = require('child_process').execSync;
  var fs = require('fs');
  var path = require('path');
  var container;
  var tmp;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'DummyClass',
      properties: ['id'],
    });
    DummyClass = foam.lookup('org.chromium.webidl.test.DummyClass');

    var JournalingContainer = foam.lookup('org.chromium.webidl.JournalingContainer');
    tmp = execSync('mktemp -d').toString().trim(-1);
    container = JournalingContainer.create({outputDir: tmp});
  });

  afterEach(function() {
    execSync(`/bin/rm -rf "${tmp}"`);
  });

  it('getDAO should return a DAO', function() {
    var filename = 'test';
    var res = container.getDAO('org.chromium.webidl.test.DummyClass', filename);
    expect(foam.dao.DAO.isInstance(res)).toBe(true);
    // Expecting a file to be created at the given path as well.
    expect(fs.existsSync(path.resolve(tmp, `${filename}-journal.js`))).toBe(true);
  });

  it('should write data to file on put', function(done) {
    var filename = 'test';
    var journal = container.getDAO('org.chromium.webidl.test.DummyClass', filename);
    var testObj = DummyClass.create({id: 1});

    journal.put(testObj).then(function() {
      var filepath = path.resolve(tmp, `${filename}-journal.js`);
      // Determine if file exists.
      expect(fs.existsSync(filepath)).toBe(true);

      // Expect the data to be retrieved properly.
      var arrayDao = foam.dao.ArrayDAO.create();

      foam.dao.JDAO.create({
        delegate: arrayDao,
        journal: foam.dao.NodeFileJournal.create({
          fd: fs.openSync(filepath, 'r+')
        }),
      }).select().then(function() {
        arrayDao.select().then(function(items) {
          expect(items.array.length).toBe(1);
          expect(foam.util.compare(items.array[0], testObj)).toBe(0);
          done();
        });
      });
    });
  });
});
