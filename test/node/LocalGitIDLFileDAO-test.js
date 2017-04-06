// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('LocalGitIDLFileDAO test', function() {
  var LocalGitIDLFileDAO;
  var InternalException;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'LocalGitIDLFileDAO',
      extends: 'org.chromium.webidl.LocalGitIDLFileDAO',

      methods: [
        // Prevent validate-and-maybe-clone-repository logic from base class
        // init().
        function init() {}
      ],
    });
    LocalGitIDLFileDAO =
        foam.lookup('org.chromium.webidl.test.LocalGitIDLFileDAO');
    InternalException = foam.lookup('foam.dao.InternalException');
  });

  it('should throw internal exception on use-synchronously after instantiation', function(done) {
    // Promise resolve = fail; promise reject = done.
    LocalGitIDLFileDAO.create().select().then(done.fail, function(error) {
      expect(InternalException.isInstance(error)).toBe(true);
      done();
    });
  });
});
2
