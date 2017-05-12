// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('BaseParser', function() {
  beforeEach(function() {
    foam.CLASS({
      name: 'TestParser',
      extends: 'org.chromium.webidl.BaseParser',

      constants: {
        PARSE_COMPLETE: 'Parse complete',
        PARSE_INCOMPLETE: 'Parse incomplete'
      },

      properties: [
        {
          name: 'separator',
          factory: function() {
            return this.Parsers.create().literal(' ');
          }
        }
      ],

      methods: [
        function symbolsFactory() {
          return Object.assign(this.SUPER(), foam.Function.withArgs(
              function(literal) {
                return {
                  START: literal('interface Frobinator;')
                }
              },
              this.Parsers.create({ separator: this.separator }),
              this));
        },
        function actionsFactory() {
          return {};
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
