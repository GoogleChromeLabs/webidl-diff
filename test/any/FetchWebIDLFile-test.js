// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchWebIDLFile', function() {
  var IDLFile;
  var GithubIDLFile;
  var GitilesIDLFile;
  var payloadContent = 'Some sort of file content';

  beforeAll(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    GithubIDLFile = foam.lookup('org.chromium.webidl.GithubIDLFile');
    GitilesIDLFile = foam.lookup('org.chromium.webidl.GitilesIDLFile');
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.test',
      name: 'MockHTTPRequest',
      extends: 'foam.net.HTTPRequest',

      methods: [
        function send() {
          if (this.url == 'http://test.url/someFile.idl') {
            return Promise.resolve(this.HTTPResponse.create({
              status: 200,
              payload: Promise.resolve(payloadContent)
            }));
          } else if (this.url == 'https://chromium.googlesource.com/chromium/src/+/0/someFile.idl?format=TEXT') {
            // Gitiles return results in Base64 encoded text
            var base64Potato = 'UG90YXRv';
            return Promise.resolve(this.HTTPResponse.create({
              status: 200,
              payload: Promise.resolve(base64Potato)
            }));
          } else {
            // Mock a failure HTTP Request
            return Promise.resolve(this.HTTPResponse.create({
              status: 404,
              payload: Promise.resolve('The request resource was not found')
            }));
          }
        }
      ]
    });

    foam.register(foam.lookup('org.chromium.webidl.test.MockHTTPRequest'), 'foam.net.HTTPRequest');
  });

  it('should fail to fetch non-existant WebIDL file', function(done) {
    var file = IDLFile.create({
      repository: 'http://someRandomURL.test/',
      path: 'file.idl',
      rawURL: 'http://someRandomURL.test/file.idl'
    });

    file.fetch().then(function() {
      done.fail(new Error("Promise was not expected to be resolved"));
    }, function(reason) {
      expect(reason.status).toEqual(404);
      done();
    });
  });

  it('should succeed fetching existant WebIDL file', function(done) {
    var file = IDLFile.create({
      repository: 'http://test.url',
      path: 'someFile.idl',
      rawURL: 'http://test.url/someFile.idl'
    });

    file.fetch().then(function(payload) {
      expect(payload).toEqual(payloadContent);
      done();
    }, function(reason) {
      done.fail(new Error("Promise was not resolved when it was expected to be"));
    });
  });

  it('should verify GithubIDLFile properties are correct', function() {
    var file = GithubIDLFile.create({
      repository: 'https://github.com/mozilla/gecko-dev',
      githubBaseURL: 'https://github.com/mozilla/gecko-dev',
      revision: '0',
      path: 'someFile.idl'
    });

    expect(file.rawURL).toEqual('https://github.com/mozilla/gecko-dev/raw/0/someFile.idl');
    expect(file.documentURL).toEqual('https://github.com/mozilla/gecko-dev/blob/0/someFile.idl');
  });

  it('should verify GitilesIDLFile properties are correct', function(done) {
    var file = GitilesIDLFile.create({
      repository: 'https://chromium.googlesource.com/chromium/src/+',
      gitilesBaseURL: 'https://chromium.googlesource.com/chromium/src/+',
      revision: '0',
      path: 'someFile.idl'
    });

    expect(file.rawURL).toEqual('https://chromium.googlesource.com/chromium/src/+/0/someFile.idl?format=TEXT');
    expect(file.documentURL).toEqual('https://chromium.googlesource.com/chromium/src/+/0/someFile.idl');

    // Testing Gitiles fetch override
    file.fetch().then(function(payload) {
      expect(payload).toEqual('Potato');
      done();
    }, function(reason) {
      done.fail(new Error("Promise was not resolved when it was expected to be"));
    });
  });
});
