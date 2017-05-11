// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchWebIDLFile', function() {
  var IDLFile;
  var payloadContent;

  beforeEach(function() {
    IDLFile = foam.lookup('org.chromium.webidl.IDLFile');
    payloadContent = 'Some sort of file content';

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
          } else {
            // Mocking a failure HTTP Request
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

  it('Attempting to fetch non-existant WebIDL file', function(done) {
    var file = IDLFile.create({
      repository: 'http://someRandomURL.test/',
      revision: '0',
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


  it('Fetching existant WebIDL file', function(done) {
    var file = IDLFile.create({
      repository: 'http://test.url',
      revision: '0',
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
});
