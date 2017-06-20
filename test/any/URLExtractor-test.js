// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('URL Extractor', function() {
  var URLExtractor;
  var IDLFileContents;

  beforeEach(function() {
    URLExtractor = foam.lookup('org.chromium.webidl.URLExtractor');
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
  });

  it('should return undefined for passing incorrect parameter type', function() {
    var extractor = URLExtractor.create();
    var results = extractor.extract('Test content');
    expect(results).toBeUndefined();
  });

  it('should return no URLs', function() {
    var extractor = URLExtractor.create();
    var file = IDLFileContents.create({
      contents: 'Test content',
    });

    var results = extractor.extract(file);
    expect(results).toBeDefined();
    expect(results.length).toBe(0);
  });

  it('should return all HTTP(s) URLs within the text fragment', function() {
    var extractor = URLExtractor.create();
    var urls = [ 'http://www.google.com', 'https://www.google.com/',
        'ftp://www.google.com', 'http://google.com', 'https://google.com',
        'https://google.com/potato', 'www.google.com' ];
    var file = IDLFileContents.create({
      contents: `
        Hello World! ${urls[0]} Some other thing
        potato ${urls[1]} test
        test ${urls[2]} potato
        test ${urls[3]} test
        potato ${urls[4]} potato
        ${urls[5]}
        test ${urls[6]} test
      `,
    });

    var results = extractor.extract(file);
    expect(results).toBeDefined();
    expect(results.length).toBe(5);
    expect(results[0]).toBe(urls[0]);
    expect(results[1]).toBe(urls[1]);
    // urls[2] not matched, since it begins with ftp://
    expect(results[2]).toBe(urls[3]);
    expect(results[3]).toBe(urls[4]);
    expect(results[4]).toBe(urls[5]);
    // urls[6] not matched, since it does not begin with protocol
  });

  it('should return all whitelisted HTTP(s) URLs', function() {
    var includeRegexp = /google\.com/;
    var extractor = URLExtractor.create({includeRegexp: includeRegexp});
    var urls = [ 'http://google.com', 'http://potato.com', 'https://google.ca',
      'https://calendar.google.com', 'http://about.potato.com' ];
    var file = IDLFileContents.create({
      contents: `
        This url should be accepted ${urls[0]}
        This url is not whitelisted ${urls[1]}
        This url is not whitelisted ${urls[2]}
        This url should be accepted ${urls[3]}
      `,
    });

    var results = extractor.extract(file);
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0]).toBe(urls[0]);
    expect(results[1]).toBe(urls[3]);
  });

  it('should return only non-blacklisted HTTP(s) URLs', function() {
    var excludeRegexp = /potato\.com|.*\.google\.com/;
    var extractor = URLExtractor.create({excludeRegexp: excludeRegexp});
    var urls = [ 'http://google.com', 'http://potato.com', 'https://google.ca',
      'https://calendar.google.com', 'http://about.potato.com' ];
    var file = IDLFileContents.create({
      contents: `
        This url should be accepted ${urls[0]},
        This url is blacklisted ${urls[1]},
        This url should be accepted ${urls[2]},
        This url is blacklisted ${urls[3]},
        This url is blacklisted ${urls[4]}
      `,
    });

    var results = extractor.extract(file);
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0]).toBe(urls[0]);
    expect(results[1]).toBe(urls[2]);
  });

  it('should return whitelisted, but not blacklisted HTTP(s) URLs', function() {
    var includeRegexp = /google\.(com|ca)/;
    var excludeRegexp = /calendar\.google\.com/;
    var extractor = URLExtractor.create({
      excludeRegexp: excludeRegexp,
      includeRegexp: includeRegexp,
    });
    var urls = [ 'https://www.google.com', 'http://calendar.google.com',
    'http://mail.google.com', 'https://about.potato.com', 'http://google.ca' ];
    var file = IDLFileContents.create({
      contents: `
        This url should be accepted ${urls[0]}
        This url is blacklisted ${urls[1]}
        This url should be accepted ${urls[2]}
        This url is not whitelisted ${urls[3]}
        This url should be accepted ${urls[4]}
      `,
    });

    var results = extractor.extract(file);
    expect(results).toBeDefined();
    expect(results.length).toBe(3);
    expect(results[0]).toBe(urls[0]);
    expect(results[1]).toBe(urls[2]);
    expect(results[2]).toBe(urls[4]);
  });
});
