// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'foam.box.Runnable',

  methods: [
    function run(args) {
      var self = this;
      var parser = args.parser;
      var urls = args.urls;
      if (!urls) throw "Missing required arguments!";

      // First extract URLs from file...
      var HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
      var HTTPRequest = foam.lookup('foam.net.RetryHTTPRequest'); // Cannot ref class directly...

      var PArr = [];

      urls.forEach(function(url, index) {
        PArr.push(HTTPRequest.create({url: url}).send())
      });


      // I do not like how this is currently written...
      // Potential for a large amount of stalling...
      Promise.all(PArr).then(function(responses) {
        responses.forEach(function(response, index) {
          if (response.status !== 200) throw response;
          response.payload.then(function(payload) {
            var file = HTMLFileContents.create({
              url: urls[index],
              timestamp: new Date(),
              contents: payload,
            });
            console.debug(index);
            self.output({ file: file, parser: parser });
          });
        });
      })
      .catch(function(ex) {
        console.warn(ex);
      });
    },
  ]
});
