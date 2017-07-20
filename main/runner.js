// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
require('foam2');

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
var include = [/dev\.w3\.org/, /github\.io/, /spec\.whatwg\.org/, /css-houdini\.org/, /csswg\.org/, /svgwg\.org/, /drafts\.fxtf\.org/, /www\.khronos\.org\/(registry\/webgl\/specs\/latest\/[12]\.0|registry\/typedarray\/specs\/latest)/, /www\.w3\.org\/TR\/geolocation-API/, /dvcs\.w3\.org\/hg\/speech-api\/raw-file\/tip\/webspeechapi\.html/];
var exclude = [/web\.archive\.org/, /archives/ ];

var LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
var URLExtractor = foam.lookup('org.chromium.webidl.URLExtractor');
var FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
var IDLFragmentExtractorRunner = foam.lookup('org.chromium.webidl.IDLFragmentExtractorRunner');
var ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner')
var CanonicalizeRunner = foam.lookup('org.chromium.webidl.CanonicalizeRunner');


// Preparing pipelines
var ctx = foam.box.Context.create();
var PipelineBuilder = foam.box.pipeline.PipelineBuilder;

// Pipeline Description
// Fetch from Repositories -> Extract IDL Files -> Process into IDLFileContents
//
//           (Blink) 1-> Extract URLs -> Fetch HTML -> Process HTML -> Process IDL Files -> ...
// ->Branch{
//           (Other) 2-> To Datastore -> ...
// -> Put partials together -> Diff -> Back to datastore
var corePath = PipelineBuilder.create(null, ctx)
                              .append(ParserRunner.create())
                              .append(CanonicalizeRunner.create());

var blinkPL = PipelineBuilder.create(null, ctx)
                             .append(FetchSpecRunner.create({ parser: 'Parser', renderer: 'Blink-WebSpec' }))
                             .append(IDLFragmentExtractorRunner.create())
                             .append(corePath)
                             .build();
var corePL = corePath.build();


// Inject properties into all of the configs.
[ blinkConfig, geckoConfig, webKitConfig ].forEach(function(config) {
  if (config.renderer === 'Blink') config.urlOutputBox = blinkPL;
  config.fileOutputBox = corePL;
  config.include = include;
  config.exclude = exclude;
  config.freshRepo = false; // For this purpose...
});


// Blink Pipeline
LocalGitRunner.create(blinkConfig).run();

// Gecko Pipeline
//LocalGitRunner.create(geckoConfig).run();

// WebKit Pipeline
//LocalGitRunner.create(webKitConfig).run();
