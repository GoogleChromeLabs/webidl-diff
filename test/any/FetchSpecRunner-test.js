// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchSpecRunner', function() {
  var MockHTTPRequest;
  var PipelineMessage;
  var outputBox;
  var errorBox;
  var runner;

  beforeEach(function() {
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    global.defineAccumulatorBox();

    // Initialize MockHTTPRequest and have it overload RetryHTTPRequest.
    global.mockHTTPRequest('foam.net.RetryHTTPRequest');
    MockHTTPRequest = foam.lookup('org.chromium.webidl.test.MockHTTPRequest');

    var FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
    var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');

    outputBox = AccumulatorBox.create();
    errorBox = AccumulatorBox.create();
    runner = FetchSpecRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
      source: WebPlatformEngine.BLINK,
      parserClass: foam.lookup('org.chromium.webidl.Parser'),
    });
  });

  it('should send an error if invalid arguments are received as a message', function() {
    // Sending any object other than a PipelineMessage object should
    // result in a message sent to errorBox.
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);
  });

  it('should send an error if message is missing URLs', function() {
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
        return o.htmlFile;
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
    var urls = [MockHTTPRequest.NON_EXISTANT_SPEC];
    var msg = PipelineMessage.create({ urls: urls });
    runner.run(msg);

    setTimeout(function() {
      expect(outputBox.results.length).toBe(0);
      expect(errorBox.results.length).toBe(1);
      done();
    }, 1000);
  });
});
