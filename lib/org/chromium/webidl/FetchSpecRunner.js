// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'foam.box.Runnable',

  methods: [
    function run(args) {
      if (!args.urls) return;
      var self = this;
      var cluster = require('cluster');
      var path = require('path');

      // Placing HTTP Fetch on separate worker
      // Changing this to forkbox later?
      cluster.setupMaster({
        exec: path.resolve(__dirname, '../../../../main/FetchWorker.js'),
      });
      var worker = cluster.fork();

      worker.on('online', function() {
        worker.send(args);
      });

      worker.on('message', function(data) {
        var obj = foam.json.parse(data);
        data.renderer = `${args.renderer}-WebSpec`;
        self.output(data);
      });
    },
  ]
});
