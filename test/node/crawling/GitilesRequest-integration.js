// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('GitilesRequest integration', function() {
  var GitilesRequest;
  var baseReq;

  beforeEach(function() {
    // TODO(markdittmer): Find a more elegant solution to sidestep browser CORS
    // issues.
    var urlPrefix = typeof window === 'undefined' ? '' :
        'https://crossorigin.me/';
    GitilesRequest = foam.lookup('org.chromium.webidl.crawlers.GitilesRequest');
    baseReq = GitilesRequest.create({
      baseURL: urlPrefix + 'https://chromium.googlesource.com/chromium/src/+',
      commit: 'master',
      path: '',
    });
  });

  function verifyDir(json) {
    expect(json instanceof Object).toBe(true);
    expect(json.id.match(/^[0-9a-fA-F]+$/)).toBeTruthy();
    expect(Array.isArray(json.entries)).toBe(true);
    expect(json.entries.filter(function(entry) {
      return entry.name &&
          (entry.type === 'blob' || entry.type === 'tree');
    })).toEqual(json.entries);
    return json;
  }

  it('should load valid JSON from chromium/master', function(done) {
    baseReq.send().then(verifyDir).then(done).catch(fail);
  });
  it('should load valid JSON from chromium/master/chrome via subdir()', function(done) {
    baseReq.subdir('chrome').send().then(verifyDir).then(done).catch(fail);
  });
  it('should load the same JSON with subdir(a, b) and subdir(a).subdir(b)', function(done) {
    // TODO(markdittmer): This could flake if the directory changes between requests.
    Promise.all([
      baseReq.subdir('extensions', 'common').send().then(verifyDir),
      baseReq.subdir('extensions').subdir('common').send().then(verifyDir),
    ]).then(function(values) {
      expect(values.length).toBe(2);
      expect(values[0]).toEqual(values[1]);
      done();
    }).catch(fail);
  });
  it('should load valid string from chromium/master/LICENSE via file()', function(done) {
    baseReq.file('LICENSE').send().then(function(str) {
      expect(str.constructor === String);
      done();
    }, fail);
  });
});
