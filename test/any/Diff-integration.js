// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Diff Integration', function() {
  var differ;
  var createMap;

  beforeEach(function() {
    var Diff = foam.lookup('org.chromium.webidl.Diff');
    var Parser = foam.lookup('org.chromium.webidl.Parser');
    differ = Diff.create();
    createMap = global.DIFF_CREATE_MAP.bind(this, Parser);
  });

  it('should return no fragments when performing diff on same source', function() {
    var blinkIdls = global.ALL_BLINK_IDL;
    var map = createMap(blinkIdls);
    var results = differ.diff(map, map);
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
