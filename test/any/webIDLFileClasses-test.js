// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Web IDL file classes', function() {
  var IDLFile;
  var GithubIDLFile;
  var GitilesIDLFile;
  var MockHTTPRequest;

  beforeAll(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
    GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
  });

  beforeEach(function() {
    global.mockHTTPRequest('foam.net.HTTPRequest');
    MockHTTPRequest = foam.lookup('org.chromium.webidl.test.MockHTTPRequest');
  });

  describe('IDLFile.fetch()', function() {
    it('should fail to fetch non-existent Web IDL file', function(done) {
      IDLFile.create({
        repository: 'http://someRandomURL.test',
        path: 'file.idl',
        rawURL: 'http://someRandomURL.test/file.idl'
      }).fetch().then(function() {
        done.fail(new Error('Expected fetch() of invalid URL to reject promise'));
      }, function(reason) {
        expect(reason.status).toBe(404);
        done();
      });
    });

    it('should succeed fetching existent Web IDL file', function(done) {
      IDLFile.create({
        repository: 'http://test.url',
        path: 'someFile.idl',
        rawURL: 'http://test.url/someFile.idl'
      }).fetch().then(function(payload) {
        expect(payload).toBe(MockHTTPRequest.BASE_PAYLOAD);
        done();
      }, function(reason) {
        done.fail(new Error('Expected fetch() of valid resource to be resolved'));
      });
    });
  });

  describe('GithubIDLFile', function() {
    var file;
    beforeAll(function() {
      file = GithubIDLFile.create({
        repository: 'https://github.com/mozilla/gecko-dev',
        githubBaseURL: 'https://github.com/mozilla/gecko-dev',
        revision: '0',
        path: 'someFile.idl'
      });
    });

    it('should verify corresponding properties are correct', function() {
      expect(file.rawURL).toBe(MockHTTPRequest.GITHUB_TEST_RAW_URL);
      expect(file.documentURL).toBe(MockHTTPRequest.GITHUB_TEST_DOCUMENT_URL);
    });

    it('should verify inherited fetch() is called', function(done) {
      file.fetch().then(function(payload) {
        expect(payload).toBe(MockHTTPRequest.GITHUB_PAYLOAD);
        done();
      }, function(reason) {
        done.fail(new Error('Expected fetch() of GitHub resource to be resolved'));
      });
    });
  });

  describe('GitilesIDLFile', function() {
    var file;
    beforeAll(function() {
      file = GitilesIDLFile.create({
        repository: 'https://chromium.googlesource.com/chromium/src/+',
        gitilesBaseURL: 'https://chromium.googlesource.com/chromium/src/+',
        revision: '0',
        path: 'someFile.idl'
      });
    });

    it('should verify corresponding properties are correct', function() {
      expect(file.rawURL).toBe(MockHTTPRequest.GITILES_TEST_RAW_URL);
      expect(file.documentURL).toBe(MockHTTPRequest.GITILES_TEST_DOCUMENT_URL);
    });

    it('should verify overwritten fetch() is called', function(done) {
      file.fetch().then(function(payload) {
        expect(payload).toBe(MockHTTPRequest.TEXT_POTATO);
        done();
      }, function(reason) {
        done.fail(new Error('Expected fetch() of Gitiles resource to be resolved'));
      });
    });
  });
});
