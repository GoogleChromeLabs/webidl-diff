// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFragmentExtractorRunner', function() {
  var IDLFragmentExtractorRunner;
  var PipelineMessage;
  var HTMLFileContents;
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

    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
    IDLFragmentExtractorRunner = foam.lookup('org.chromium.webidl.IDLFragmentExtractorRunner');
    PipelineMessage = foam.lookup('org.chromium.webidl.PipelineMessage');
    ResultBox = foam.lookup('org.chromium.webidl.Test.ResultBox');
  });

  it('should send an error if invalid arguments are received as a message', function() {
    var wrongObj = {};
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();

    var runner = IDLFragmentExtractorRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    runner.run(wrongObj);
    expect(errorBox.results.length).toBe(1);

    // Missing HTML file
    var msg = PipelineMessage.create();
    runner.run(msg);
    expect(errorBox.results.length).toBe(2);
  });

  it('should extract the IDL fragments given a valid message', function() {
    var outputBox = ResultBox.create();
    var errorBox = ResultBox.create();
    var runner = IDLFragmentExtractorRunner.create({
      outputBox: outputBox,
      errorBox: errorBox,
    });

    var htmlFile = HTMLFileContents.create({
      url: 'http://testURL.test',
      timestamp: new Date(0),
      contents: `
          <html>
            <body>
              <pre class="idl">Test Content 1</pre>
              <pre class="idl">Test Content 2</pre>
            </body>
          </html>`
    });

    var msg = PipelineMessage.create({ htmlFile: htmlFile });
    runner.run(msg);
    // One result for each pre div
    expect(outputBox.results.length).toBe(2);
    expect(errorBox.results.length).toBe(0);

    var results = outputBox.results.map(function(o) {
      return o.object;
    });
    // The messages should be different objects (different fragments).
    expect(results[0]).not.toEqual(results[1]);
  });
});
