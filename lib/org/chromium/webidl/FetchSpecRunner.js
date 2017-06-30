// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FetchSpecRunner',

  extends: 'foam.box.Runnable',

  requires: ['org.chromium.webidl.PipelineMessage'],

  methods: [
    function run(message) {
      if (!this.PipelineMessage.isInstance(message))
        throw new Error("FetchSpecRunner: run() expects a PipelineMessage object!");
      else if (!message.urls)
        throw new Error("FetchSpecRunner: URLs property of message does not exist!");

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
