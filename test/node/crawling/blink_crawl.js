// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Blink crawl', function() {
  var GitilesCrawler;
  var GitilesRequest;
  var GitilesRequestType;
  var originalTimeout;

  beforeEach(function() {
    GitilesCrawler = foam.lookup('org.chromium.webidl.crawlers.GitilesCrawler');
    GitilesRequest = foam.lookup('org.chromium.webidl.crawlers.GitilesRequest');
    GitilesRequestType =
        foam.lookup('org.chromium.webidl.crawlers.GitilesRequestType');

    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should crawl Blink', function(done) {
    var dirRejectRegExp =
        /(Source[/]core[/]testing|Source[/]modules.*[/]testing|bindings[/]tests)/;
    var fileAcceptRegExp = /[.]idl$/;
    var crawler = GitilesCrawler.create({
      baseURL: 'https://chromium.googlesource.com/chromium/src/+',
      commit: 'master',
      basePath: 'third_party/WebKit/Source',
      acceptDir: function(path) { return !path.match(dirRejectRegExp); },
      acceptFile: function(path) { return path.match(fileAcceptRegExp); },
    });
    crawler.start.sub(function() {
      console.log('START');
    });
    crawler.file.sub(function(_, __, file) {
      console.info('FILE', file.path);
    });
    crawler.end.sub(function() {
      console.log('END');
      done();
    });

    crawler.run();
  });
});
