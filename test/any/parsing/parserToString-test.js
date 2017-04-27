// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('parser toString()', function() {
  it('should completely describe parser', function() {
    var sep = foam.lookup('foam.parse.Literal').create({s: ' '});
    var parser = foam.Function.withArgs(
        function(plus0, tseq, tseq1, trepeat, tplus) {
          return plus0(tseq('a', tseq1(1, 'b', trepeat(tplus('c')))));
        },
        foam.lookup('org.chromium.webidl.parsers.TokenParsers').create({
          separator: sep,
        }),
        this);

    expect(parser.toString()).toBe(
        'plus0(tseq("a", tseq1(1, "b", trepeat(tplus("c")))))');
  });
});
