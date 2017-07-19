// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',
  extends: 'org.chromium.webidl.PipelineRunner',

  methods: [
    function run(message) {
      var sup = this.SUPER(message);

      // If SUPER threw an error, then we are done.
      if (sup) return;

      if (!message.urls)
        this.error(this.fmtErrorMsg('URL property of PipelineMessage is missing!'));

      var self = this;
      var cluster = require('cluster');
      var path = require('path');

      // Placing HTTP Fetch on separate worker
      cluster.setupMaster({
        exec: path.resolve(__dirname, '../../../../main/FetchWorker.js'),
      });
      var worker = cluster.fork();

      worker.on('online', function() {
        var obj = foam.json.Network.objectify(message);
        worker.send(obj);
      });

      worker.on('message', function(data) {
        var obj = foam.json.parse(data);
        obj.renderer = `${message.renderer}-WebSpec`;
        self.output(obj);
      });
    },
  ]
});
