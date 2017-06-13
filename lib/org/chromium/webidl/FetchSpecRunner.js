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
      var urlMap = args.urlMap;
      if (!urlMap) throw "Missing required arguments!";

      // First extract URLs from file...
      var HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
      var HTTPRequest = foam.lookup('foam.net.HTTPRequest'); // Cannot ref class directly...

      // Fetch HTML Files (Add a reference to where the URL comes from...
      for (var url in urlMap) {
        HTTPRequest.create({url: url}).send()
          .then(function(response) {
            if (response.status !== 200) throw response; // Maybe change this to errorbox
            response.payload.then(function(payload) {
              var file = HTMLFileContents.create({
                url: url,
                reference: urlMap[url],
                timestamp: new Date(),
                content: payload,
              });
            self.output({ file: file, parser: parser });
          });
        })
        .catch(function(ex) {
          console.log(url);
          console.log(ex); // Handle this properly or output to errorbox...
        });
    }
  },
]
});
