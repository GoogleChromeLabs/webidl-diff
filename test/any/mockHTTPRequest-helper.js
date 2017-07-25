// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.mockHTTPRequest = function(HTTPClass) {
  foam.CLASS({
    package: 'org.chromium.webidl.test',
    name: 'MockHTTPRequest',
    extends: 'foam.net.HTTPRequest',

    constants: {
      SIMPLE_TEST_URL: 'http://test.url/someFile.idl',
      BASE_PAYLOAD: 'Some sort of file content',
      GITHUB_PAYLOAD: 'Some sort of other content',
      GITHUB_TEST_RAW_URL: 'https://github.com/mozilla/gecko-dev/raw/0/someFile.idl',
      GITHUB_TEST_DOCUMENT_URL: 'https://github.com/mozilla/gecko-dev/blob/0/someFile.idl',
      GITILES_TEST_RAW_URL: 'https://chromium.googlesource.com/chromium/src/+/0/someFile.idl?format=TEXT',
      GITILES_TEST_DOCUMENT_URL: 'https://chromium.googlesource.com/chromium/src/+/0/someFile.idl',
      TEXT_POTATO: 'Potato',
      BASE_64_POTATO: 'UG90YXRv', // TEXT_POTATO in base64.
      MICROSYNTAXES_URL: 'https://html.spec.whatwg.org/multipage/common-microsyntaxes.html',
      MICROSYNTAXES_CONTENT: 'This is the Microsyntaxes Spec Page',
      FETCHING_URL: 'https://html.spec.whatwg.org/multipage/urls-and-fetching.html',
      FETCHING_CONTENT: 'This is the URLs and Fetching Spec Page',
      NON_EXISTENT_SPEC: 'https://w3c.github.io/mediacapture-imge',
    },

    properties: [
      {
        name: 'urlMap',
        factory: function() {
          var map = {};

          map[this.SIMPLE_TEST_URL] = this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(this.BASE_PAYLOAD)
          });

          map[this.GITILES_TEST_RAW_URL] = this.HTTPResponse.create({
            // Gitiles return results in Base64 encoded text.
            status: 200,
            payload: Promise.resolve(this.BASE_64_POTATO)
          });

          map[this.GITHUB_TEST_RAW_URL] = this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(this.GITHUB_PAYLOAD)
          });

          map[this.MICROSYNTAXES_URL] = this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(this.MICROSYNTAXES_CONTENT)
          });

          map[this.FETCHING_URL] = this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(this.FETCHING_CONTENT)
          });
          return map;
        },
      },
    ],

    methods: [
      function send() {
        var response = this.urlMap[this.url];
        if (response !== undefined) {
          return Promise.resolve(response);
        } else {
          return Promise.resolve(this.HTTPResponse.create({
            status: 404,
            payload: Promise.resolve('The requested resource was not found')
          }));
        }
      },
    ]
  });

  foam.register(
    foam.lookup('org.chromium.webidl.test.MockHTTPRequest'),
    HTTPClass);
}
