// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Load FOAM
require('foam2');
require('../node_modules/foam2/src/foam/nanos/nanos.js');

var path = require('path');
var rootDir = path.resolve(__dirname, '..');
// Load files into global.WEB_IDL_DIFF_FILES.
require(path.resolve(rootDir, 'config', 'files.js'));
var files = global.WEB_IDL_DIFF_FILES.slice();
for (var i = 0; i < files.length; i++) {
  require(path.resolve(rootDir, files[i]));
}

//-----------------------------------------------------------------------------
const blinkConfig = require('./blinkConfig.js').config;
const geckoConfig = require('./geckoConfig.js').config;
const webKitConfig = require('./webKitConfig.js').config;

// URL Filters
var includeRegexp = /(dev[.]w3[.]org|[.]github[.]io|spec[.]whatwg[.]org|css-houdini[.]org|csswg[.]org|svgwg[.]org|drafts[.]fxtf[.]org|www[.]khronos[.]org[/](registry[/]webgl[/]specs[/]latest[/][12][.]0|registry[/]typedarray[/]specs[/]latest)|www[.]w3[.]org[/]TR[/]geolocation-API[/]|dvcs.w3.org[/]hg[/]speech-api[/]raw-file[/]tip[/]webspeechapi[.]html)/;
var excludeRegexp = /web[.]archive[.]org/;

var LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
var URLExtractor = foam.lookup('org.chromium.webidl.URLExtractor');
var FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
var IDLFragmentExtractorRunner = foam.lookup('org.chromium.webidl.IDLFragmentExtractorRunner');
var ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner')
var CanonicalizeRunner = foam.lookup('org.chromium.webidl.CanonicalizeRunner');


// Preparing pipelines
var ctx = foam.box.Context.create();
var PipelineBuilder = foam.box.pipeline.PipelineBuilder;
var builder = PipelineBuilder.create(null, ctx);

// Pipeline Description
// Fetch from Repositories -> Extract IDL Files -> Process into IDLFileContents
//
//           (Blink) 1-> Extract URLs -> Fetch HTML -> Process HTML -> Process IDL Files -> ...
// ->Branch{
//           (Other) 2-> To Datastore -> ...
// -> Put partials together -> Diff -> Back to datastore


var pipeline = builder.then(ParserRunner.create());
//                      .then(CanonicalizeRunner.create());

pipeline.first(LocalGitRunner.create());            // Common pipeline
pipeline.first(IDLFragmentExtractorRunner.create()) // Special blink path
        .first(FetchSpecRunner.create())
        .first(LocalGitRunner.create());


pipeline.then(CanonicalizeRunner.create());

// boxes[0] -> Common
// boxes[1] -> Special Blink Path
var boxes = pipeline.buildAll();

var blinkMsg = foam.box.Message.create({ object: {
  config: blinkConfig,
  freshRepo: false,
  includeRegexp: includeRegexp,
  excludeRegexp: excludeRegexp,
}});


// Blink Pipeline
//boxes[0].send(blinkMsg);
boxes[1].send(blinkMsg);

// Gecko Pipeline
//boxes[1].send(foam.box.Message.create({ object: { config: geckoConfig, freshRepo: false } }));

// Webkit Pipeline
//boxes[1].send(foam.box.Message.create({ object: { config: webKitConfig, freshRepo: false } }));
