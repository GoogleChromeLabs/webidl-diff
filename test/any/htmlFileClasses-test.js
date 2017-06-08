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
    var content = '<html></html>';
    var date = new Date();
    var file = HTMLFileContents.create({
      url: url,
      timestamp: new Date(),
      content: content
    });

    // Verify properties are as set
    expect(file.url).toBe(url);
    expect(file.timestamp.getTime()).toBe(date.getTime());
    expect(file.content).toBe(content);
  });

  it('should fail to set HTMLFileContent props after creation', function() {
    var initUrl = 'http://someTest.url/index.html';
    var newUrl = 'http://someOther.url/index.html';
    var initContent = '<html></html>';
    var newContent = '<html>Potato</html>';
    var origDate = new Date(0);
    var newDate = new Date();

    var file = HTMLFileContents.create({
      url: initUrl,
      timestamp: origDate,
      content: initContent
    });

    // On set, they should fail
    expect(function() { file.url = newUrl; }).toThrow();
    expect(file.url).toBe(initUrl);
    expect(function() { file.content = newContent; }).toThrow();
    expect(file.content).toBe(initContent);
    expect(function() { file.timestamp = newDate; }).toThrow();
    expect(file.timestamp.getTime()).toBe(origDate.getTime());
  });
});
