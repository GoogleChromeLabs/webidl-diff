// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BlinkIDLFileDAO test', function() {
  var BlinkIDLFileDAO;
  var InternalException;

  beforeEach(function() {
    BlinkIDLFileDAO = foam.lookup('org.chromium.webidl.BlinkIDLFileDAO');
    InternalException = foam.lookup('foam.dao.InternalException');
  });

  it('should throw internal exception on use-synchronously after instantiation', function(done) {
    // Promise resolve = fail; promise reject = done.
    BlinkIDLFileDAO.create().select().then(done.fail, function(error) {
      expect(InternalException.isInstance(error)).toBe(true);
      done();
    });
  });
});
2
