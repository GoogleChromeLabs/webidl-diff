// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchSpecRunner', function() {
  var FetchSpecRunner;
  var PipelineMessage;
  var ResultBox;

  beforeEach(function() {
    foam.CLASS({
      package: 'org.chromium.webidl.Test',
      name: 'ResultBox',
      implements: ['foam.box.Box'],

      properties: [
        {
          class: 'Array',
          name: 'results',
        },
      ],

      methods: [
        function send(msg) {
          this.results.push(msg);
        },
        function clear() {
          this.results = [];
        }
      ]
    });

    FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    ResultBox = foam.lookup('org.chromium.webidl.Test.ResultBox');
  });

  it('should send an error if invalid arguments are received as a message', function() {
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();
    var runner = FetchSpecRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    // Sending any object other than a PipelineMessage object should
    // result in a message sent to errorBox.
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);

    // Sending a PipelineMessage that is missing urls field should
    // result in a message sent to errorBox.
    var msg = PipelineMessage.create();
    runner.run(msg);
    expect(errorBox.results.length).toBe(2);
  });

  it('should spawn a worker and fetch the given URLs', function(done) {
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();
    var runner = FetchSpecRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    var urls = [
      'https://html.spec.whatwg.org/multipage/common-microsyntaxes.html',
      'https://html.spec.whatwg.org/multipage/urls-and-fetching.html',
    ];
    var msg = PipelineMessage.create({ urls: urls });
    runner.run(msg);

    // Check back in a few seconds to allow for fetching.
    setTimeout(function() {
      expect(outputBox.results.length).toBe(2);
      expect(errorBox.results.length).toBe(0);

      var htmlFiles = outputBox.results.map(function(o) {
        return o.object.htmlFile;
      });

      // Verify that correct pages were fetched.
      expect(htmlFiles[0].id[0]).not.toBe(htmlFiles[1].id[0]);
      expect(htmlFiles[0].contents).not.toBe(htmlFiles[1].contents);
      done();
    }, 3000);
  });
});
