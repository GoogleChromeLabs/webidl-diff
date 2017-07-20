// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('foam2');
var HTTPRequest = foam.lookup('foam.net.RetryHTTPRequest');

process.on('message', function(url) {
  HTTPRequest.create({url:url}).send()
    .then(function(response) {
      if (response.status !== 200)
        throw `Received response status ${response.status}`;
      response.payload.then(function(payload) {
        var file = {
          url: url,
          timestamp: new Date(),
          contents: payload,
        };
        process.send(file);
      });
    }).catch(function(ex) {
      // Cannot send over an error, so we send a string instead.
      process.send(`Failed to fetch ${url}, Exception: ${ex}`);
    });
});
