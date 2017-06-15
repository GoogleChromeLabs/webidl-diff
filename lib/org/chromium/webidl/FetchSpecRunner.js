// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'foam.box.Runnable',

  methods: [
    function run(args) {
      var URL = require('url');
      var self = this;
      var parser = args.parser;
      var urls = args.urls;
      if (!urls) throw "Missing required arguments!";

      // First extract URLs from file...
      var HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
      var HTTPRequest = foam.lookup('foam.net.HTTPRequest'); // Cannot ref class directly...

      // Fetch HTML Files (Add a reference to where the URL comes from...
      urls.forEach(function(url, index) {
        HTTPRequest.create({url: url}).send()
          .then(function(response) {
            if (response.status !== 200) throw response; // Maybe change this to errorbox
            response.payload.then(function(payload) {
              var file = HTMLFileContents.create({
                url: url,
                //references: urlMap[url],
                timestamp: new Date(),
                contents: payload,
              });
            console.debug(index);
            //self.output({index});
            self.output({ file: file, parser: parser });
          });
        })
        .catch(function(ex) {
          console.warn(url);
          console.warn(ex); // Handle this properly or output to errorbox...
        });
    });
  },
]
});
