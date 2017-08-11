// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractorRunner', function() {
  var HTMLFileContents;
  var IDLFragmentExtractorRunner;

  var outputBox;
  var errorBox;
  var runner;

  beforeEach(function() {
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractorRunner = foam.lookup('org.chromium.webidl.IDLFragmentExtractorRunner');

    global.defineAccumulatorBox();
    var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
    outputBox = AccumulatorBox.create();
    errorBox = AccumulatorBox.create();
    runner = IDLFragmentExtractorRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });
  });

  it('should send an error if invalid arguments are received as a message', function() {
    var wrongObj = {};
    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);
  });

  it('should extract the IDL fragments given a valid message', function() {
    var url = 'http://testURL.test';
    var timestamp = new Date(0);

    var htmlFile = HTMLFileContents.create({
      url: url,
      timestamp: timestamp,
      contents: `
          <html>
            <body>
              <pre class="idl">Test Content 1</pre>
              <pre class="idl">Test Content 2</pre>
            </body>
          </html>`
    });

    runner.run(htmlFile);
    // One result for each pre div.
    expect(outputBox.results.length).toBe(2);
    expect(errorBox.results.length).toBe(0);

    var results = outputBox.results;

    // The messages should be different objects (different fragments).
    expect(results[0]).not.toEqual(results[1]);

    // Expect the metadata to be correct.
    expect(results[0].id.includes(url)).toBe(true);
    expect(results[0].id.includes(timestamp)).toBe(true);
    expect(results[1].id.includes(url)).toBe(true);
    expect(results[1].id.includes(timestamp)).toBe(true);
  });
});
