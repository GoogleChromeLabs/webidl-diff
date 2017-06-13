// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'URLExtractor',
  extends: 'foam.box.Runnable',

  properties: [
    {
      name: 'total',
    },
    {
      name: 'processed',
      value: 0,
    },
    {
      name: 'urlMap',
      factory: function() { return {}; },
    },
  ],


  constants: {
    URL_REGEX: /https?:\/\/[^/]+(\/[^?#, \n]*)?(\?[^#, \n]*)?/g,
  },

  methods: [
    function run(args) {
      // Aggregator...
      var file = args.file;
      var parser = args.parser;
      var count = args.count;
      var self = this;

      if (!file && !count) throw "Missing required argument!";
      if (file) {
        var ref = file.metadata.documentURL;
        var urls = file.contents.match(this.URL_REGEX) || [];
        urls.forEach(function(url) {
          var entry = self.urlMap[url];
          if (entry === undefined) {
            self.urlMap[url] = [ ref ];
          } else {
            self.urlMap[url].push(ref);
          }
        });
        this.processed++;
      } else {
        // Sentinel. No need to process...
        this.total = count;
      }

      if (this.processed === this.total) {
        this.output({ urlMap: this.urlMap });
      }
    },
  ]
});
