// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('HTML file classes', function() {
  var HTMLFileContents;

  beforeEach(function() {
    HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
  });

  it('should fetch some content and properly set the timestamp', function() {
    var url = 'http://someTest.url/index.html';
    var contents = '<html></html>';
    var date = new Date();
    var file = HTMLFileContents.create({
      url: url,
      timestamp: new Date(),
      contents: contents
    });

    // Verify properties are as set
    expect(file.url).toBe(url);
    expect(file.timestamp.getTime()).toBe(date.getTime());
    expect(file.contents).toBe(contents);
  });
});
