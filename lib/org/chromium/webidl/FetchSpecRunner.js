// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.HTMLFileContents'],

  constants: {
    MISSING_URLS: 'URL property of PipelineMessage is missing!',
  },

  methods: [
    function run(message) {
      var sup = this.SUPER(message);

      // If SUPER threw an error, then we are done.
      if (sup) return;

      var urls = message.urls;
      if (!urls)
        return this.error(this.fmtErrorMsg(this.MISSING_URLS));

      // TODO: Replace Node Clusters with Dedicated worker using FOAM Registries.
      var self = this;
      var cluster = require('cluster');
      var path = require('path');

      // Instantiating Node instance to handle HTTP Fetching.
      cluster.setupMaster({
        silent: true,
        exec: path.resolve(__dirname, './fetchWorkerScript.js'),
      });
      var worker = cluster.fork();

      worker.on('online', function() {
        worker.send(urls);
      });

      worker.on('message', function(data) {
        if (typeof data !== 'object')
          this.error(this.fmtErrorMsg(data));

        var htmlFile = this.HTMLFileContents.create(data);
        var newMessage = this.PipelineMessage.create({
          htmlFile: htmlFile,
          parser: message.parser,
          renderer: `${message.renderer}-WebSpec`,
        });
        this.output(newMessage);
      }.bind(this));
    },
  ]
});
