// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  requires: ['org.chromium.webidl.HTMLFileContents'],

  documentation: `A runnable box that expects to receive a PipelineMessage
    containing an array of URLs. The component will spawn a HTTP worker,
    which fetches the pages at the given URLs.`,

  constants: {
    MISSING_URLS: 'URL property of PipelineMessage is missing!',
  },

  properties: [
    {
      documentation: `Name of parser that is used to parse IDL
        fragments from the fetched HTML files.`,
      name: 'parser',
      required: true,
    },
    {
      documentation: `Name of group which the IDL files are canonicalized with.`,
      name: 'renderer',
      required: true
    },
    {
      class: 'Array',
      of: 'String',
      documentation: 'List of URLs that have been fetched by this component.',
      name: 'urls_',
    },
    {
      documentation: 'A Node instance that is dedicated to fetching HTTP requests.',
      name: 'worker_',
    },
  ],

  methods: [
    function init() {
      // TODO: Replace Node Clusters with Dedicated worker using FOAM Registries.
      var cluster = require('cluster');
      var path = require('path');

      // Instantiating Node instance to handle HTTP fetching.
      cluster.setupMaster({
        silent: true,
        exec: path.resolve(__dirname, './fetchWorkerScript.js'),
      });
      this.worker_ = cluster.fork();

      // Setting listeners on returning messages.
      this.worker_.on('online', function() {
        this.workerReady_ = true;
      }.bind(this));

      this.worker_.on('message', function(data) {
        if (typeof data !== 'object')
          return this.error(this.fmtErrorMsg(data));

        var htmlFile = this.HTMLFileContents.create(data);
        var newMessage = this.PipelineMessage.create({
          htmlFile: htmlFile,
          parser: this.parser,
          renderer: this.renderer,
        });
        this.output(newMessage);
      }.bind(this));
    },
    function run(message) {
      var sup = this.SUPER(message);

      // If SUPER threw an error, then we are done.
      if (sup) return;

      var urls = message.urls;
      if (!urls)
        return this.error(this.fmtErrorMsg(this.MISSING_URLS));

      // Check to see if URL has been fetched previously.
      urls.forEach(function(url) {
        if (!this.urls_.includes(url)) {
          this.urls_.push(url);
          this.worker_.send(url);
        }
      }.bind(this));
    },
  ]
});
