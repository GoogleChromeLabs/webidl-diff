// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BaseParser', function() {
  beforeEach(function() {
    foam.CLASS({
      name: 'TestParser',
      extends: 'org.chromium.webidl.BaseParser',
      implements: [ 'foam.parse.Parsers' ],

      properties: [
        {
          name: 'separator',
          factory: function() {
            return this.literal(' ');
          }
        }
      ],

      methods: [
        function symbolsFactory() {
          return { START: this.literal('interface Frobinator;') };
        }
      ]
    });
  });

  it('should report parse complete status to console', function() {
    console.info = jasmine.createSpy();
    TestParser.create().logParse('interface Frobinator;');
    expect(console.info).toHaveBeenCalledWith(TestParser.PARSE_COMPLETE);
  });

  it('should report parse incomplete status to console', function() {
    console.warn = jasmine.createSpy();
    TestParser.create().logParse('interface');
    expect(console.warn).toHaveBeenCalledWith(TestParser.PARSE_INCOMPLETE);
  });
});
