// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BlinkIDLFileDAO', function() {
  var testCtx;
  var BlinkIDLFileDAO;
  var InternalException;

  beforeEach(function() {
    testCtx = foam.__context__.createSubContext({});
    global.fakeHTTPRoutes(testCtx);

    BlinkIDLFileDAO = testCtx.lookup('org.chromium.webidl.BlinkIDLFileDAO');
    InternalException = testCtx.lookup('foam.dao.InternalException');
  });

  it('should throw internal exception on use-synchronously after instantiation', function(done) {
    // Promise resolve = fail; promise reject = done.
    BlinkIDLFileDAO.create().select().then(fail, function(error) {
      expect(InternalException.isInstance(error)).toBe(true);
      done();
    });
  });

  it('should be ready to use after a 1s delay when mocking network responses', function(done) {
    var dao = BlinkIDLFileDAO.create();
    setTimeout(function() { dao.select().then(done, fail); }, 1000);
  });
});
