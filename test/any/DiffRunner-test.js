// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('DiffRunner', function() {
  var CanonicalCollection;
  var WebPlatformEngine;

  var outputBox;
  var errorBox;
  var runner;
  var createMap;

  beforeEach(function() {
    CanonicalCollection = foam.lookup('org.chromium.webidl.CanonicalCollection');
    WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    var DiffRunner = foam.lookup('org.chromium.webidl.DiffRunner');
    var Parser = foam.lookup('org.chromium.webidl.Parser');

    errorBox = AccumulatorBox.create();
    outputBox = AccumulatorBox.create();
    runner = DiffRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });
    createMap = global.DIFF_CREATE_MAP.bind(this, Parser);
  });

  it('should send an error if invalid arguments are received as message', function() {
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);
  });

  it('should return no diff chunks if only one source is provided', function() {
    var msg = CanonicalCollection.create({
      definitions: createMap(`interface Test {};`),
      source: WebPlatformEngine.BLINK,
    });

    runner.run(msg);
    expect(errorBox.results.length).toBe(0);
    expect(outputBox.results.length).toBe(0);
  });

  it('should return diff chunk if definitions differ and they are from different sources', function() {
    var firstMsg = CanonicalCollection.create({
      definitions: createMap(`interface Test {};`),
      source: WebPlatformEngine.BLINK,
    });
    var secondMsg = CanonicalCollection.create({
      definitions: createMap(`interface Test : Base {};`),
      source: WebPlatformEngine.GECKO,
    });

    runner.run(firstMsg);
    runner.run(secondMsg);
    expect(errorBox.results.length).toBe(0);
    expect(outputBox.results.length).toBe(1);
  });

  it('should perform diff between all sources', function() {
    var firstMsg = CanonicalCollection.create({
      definitions: createMap(`interface Test {};`),
      source: WebPlatformEngine.BLINK,
    });
    var secondMsg = CanonicalCollection.create({
      definitions: createMap(`interface Test : Base {};`),
      source: WebPlatformEngine.GECKO,
    });
    var thirdMsg = CanonicalCollection.create({
      definitions: createMap(`interface Base {};`),
      source: WebPlatformEngine.WEBKIT
    });

    runner.run(firstMsg);
    runner.run(secondMsg);
    runner.run(thirdMsg);

    // Expecting 3 diffs to be performed:
    // Blink vs Gecko, Blink vs WebKit, Gecko vs WebKit.
    expect(outputBox.results.length).toBe(3);
    expect(outputBox.results[0].leftSource).toBe(WebPlatformEngine.GECKO);
    expect(outputBox.results[0].rightSource).toBe(WebPlatformEngine.BLINK);
    expect(outputBox.results[1].leftSource).toBe(WebPlatformEngine.WEBKIT);
    expect(outputBox.results[1].rightSource).toBe(WebPlatformEngine.BLINK);
    expect(outputBox.results[2].leftSource).toBe(WebPlatformEngine.WEBKIT);
    expect(outputBox.results[2].rightSource).toBe(WebPlatformEngine.GECKO);

    var chunks = outputBox.results.reduce(function(arr, res) {
      return arr.concat(res.chunks);
    }, []);

    // Expecting 5 DiffChunks:
    // 1. Diff between firstMsg and secondMsg (one inherits from Base).
    // 2. Test defined in Blink, but not WebKit.
    // 3. Base defined in Webkit, but not Blink.
    // 4. Test defined in Gecko, but not WebKit.
    // 5. Base defined in WebKIt, but not Gecko.
    expect(chunks.length).toBe(5);
  });
});
