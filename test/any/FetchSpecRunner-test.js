// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchSpecRunner', function() {
  var FetchSpecRunner;
  var MockHTTPRequest;
  var PipelineMessage;
  var ResultBox;
  var outputBox;
  var errorBox;
  var runner;

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
    // Initialize MockHTTPRequest and have it overload RetryHTTPRequest.
    global.mockHTTPRequest('foam.net.RetryHTTPRequest');
    MockHTTPRequest = foam.lookup('org.chromium.webidl.test.MockHTTPRequest');

    outputBox = ResultBox.create();
    errorBox = ResultBox.create();
    runner = FetchSpecRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });
  });

  it('should send an error if invalid arguments are received as a message', function() {
    // Sending any object other than a PipelineMessage object should
    // result in a message sent to errorBox.
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);
  });

  it('should send an error if message is missing urls field', function() {
    var msg = PipelineMessage.create();
    runner.run(msg);
    expect(errorBox.results.length).toBe(1);
  });

  it('should fetch all of the given URLs', function(done) {
    var urls = [
      MockHTTPRequest.MICROSYNTAXES_URL,
      MockHTTPRequest.FETCHING_URL,
    ];
    var msg = PipelineMessage.create({ urls: urls });
    runner.run(msg);

    // Check back in a second to allow for fetching.
    // TODO: Add a component that is used to known when it is safe
    // to run expect().
    setTimeout(function() {
      expect(outputBox.results.length).toBe(2);
      expect(errorBox.results.length).toBe(0);

      var htmlFiles = outputBox.results.map(function(o) {
        return o.object.htmlFile;
      });

      // Verify that correct pages were fetched.
      expect(htmlFiles[0].id[0]).toBe(MockHTTPRequest.MICROSYNTAXES_URL);
      expect(htmlFiles[1].id[0]).toBe(MockHTTPRequest.FETCHING_URL);
      expect(htmlFiles[0].contents).toBe(MockHTTPRequest.MICROSYNTAXES_CONTENT);
      expect(htmlFiles[1].contents).toBe(MockHTTPRequest.FETCHING_CONTENT);
      done();
    }, 1000);
  });

  it('should only fetch URLs once', function(done) {
    var urls = [
      MockHTTPRequest.MICROSYNTAXES_URL,
      MockHTTPRequest.MICROSYNTAXES_URL,
    ];
    var msg = PipelineMessage.create({ urls: urls });
    runner.run(msg);

    // Check back in a second to allow for fetching.
    setTimeout(function() {
      expect(outputBox.results.length).toBe(1);
      expect(errorBox.results.length).toBe(0);
      done();
    }, 1000);
  });

  it('should send an error to errorBox if given a non-existent URL', function(done) {
    var urls = [this.NON_EXISTANT_SPEC];
    var msg = PipelineMessage.create({ urls: urls });
    runner.run(msg);

    setTimeout(function() {
      expect(outputBox.results.length).toBe(0);
      expect(errorBox.results.length).toBe(1);
      done();
    }, 1000);
  });
});
