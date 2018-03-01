// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('GeckoParser', function () {
    var Parser;
    var GeckoParser;
    var FileIterator;
    var BaseIDLFile;
    var outputBox;
    var errorBox;
    var config;
    var oldContext;
  
    beforeAll(function () {
        Parser = foam.lookup('org.chromium.webidl.Parser');
        GeckoParser = foam.lookup('org.chromium.webidl.GeckoParser');
        FileIterator = foam.lookup('org.chromium.webidl.FileIterator');
        BaseIDLFile = foam.lookup('org.chromium.webidl.BaseIDLFile');

        // Creating new context for AccumulatorBox to be defined in.
        oldContext = foam.__context__;
        foam.__context__ = foam.createSubContext({});
        global.defineAccumulatorBox();

        var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
        outputBox = AccumulatorBox.create();
        errorBox = AccumulatorBox.create();

        config = {
            path: require('path').resolve(__dirname, 'data'),
            extension: 'widl',
            fileContentsFactory: function (path, contents) {
                return BaseIDLFile.create({
                    contents: contents,
                });
            },
            outputBox: outputBox,
            errorBox: errorBox,
        }
    });

    afterAll(function () {
        // Reset context and clean up repo data.
        foam.__context__ = oldContext;
    });

    function parse(str, opt_production) {
        var p = GeckoParser.create().parseString(str, 'Test', opt_production);
        expect(p.pos).toBe(str.length);
        expect(p.value).toBeDefined();
        return p;
    }

    it('should collect the IDL files', function (done) {
        var onDone = function () {
            expect(outputBox.results.length > 0).toBe(true);
            expect(errorBox.results.length).toBe(0);
            done();
        }.bind(this);

        config.onDone = onDone;
        FileIterator.create(config).run();
    });

    it('should parse all the collected IDL files', function () {
        outputBox.results.forEach(function(result) {
            expect(result.contents && result.contents.length).toBeTruthy();
            parse(result.contents);
        })
    });
});
