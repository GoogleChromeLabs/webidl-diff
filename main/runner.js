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
var blinkConfig = require('./blinkConfig.js').config;
var geckoConfig = require('./geckoConfig.js').config;
var webKitConfig = require('./webKitConfig.js').config;

// URL Filters
var include = [/dev\.w3\.org/, /github\.io/, /spec\.whatwg\.org/,
    /css-houdini\.org/, /csswg\.org/, /svgwg\.org/, /drafts\.fxtf\.org/,
    /www\.khronos\.org\/(registry\/webgl\/specs\/latest\/[12]\.0|registry\/typedarray\/specs\/latest)/,
    /www\.w3\.org\/TR\/geolocation-API/,
    /dvcs\.w3\.org\/hg\/speech-api\/raw-file\/tip\/webspeechapi\.html/];
var exclude = [/web\.archive\.org/, /archives/, /multipage/];

var LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
var WebPlatformEngine = foam.lookup('org.chromium.webidl.WebPlatformEngine');
var URLExtractor = foam.lookup('org.chromium.webidl.URLExtractor');
var FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
var FetchSpecRegistrySelector = foam.lookup('org.chromium.webidl.FetchSpecRegistrySelector');
var IDLFragmentExtractorRunner = foam.lookup('org.chromium.webidl.IDLFragmentExtractorRunner');
var ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner');
var CanonicalizerRunner = foam.lookup('org.chromium.webidl.CanonicalizerRunner');
var DiffRunner = foam.lookup('org.chromium.webidl.DiffRunner');
var JournalingContainer = foam.lookup('org.chromium.webidl.JournalingContainer');

var PipelineBuilder = foam.box.pipeline.PipelineBuilder;

// Preparing general context for Pipelines.
var ctx = foam.box.Context.create();
ctx = JournalingContainer.create({
  outputDir: path.resolve(__dirname, '../data'),
}, ctx);

// Inject properties into all of the configs.
var sharedPath = PipelineBuilder.create(null, ctx)
  .append(DiffRunner.create(null, ctx));

[blinkConfig, geckoConfig, webKitConfig].forEach(function(config) {
  var localCtx = ctx.__subContext__.createSubContext({source: config.source});
  var corePath = PipelineBuilder.create(null, ctx)
      .append(ParserRunner.create({parserType: config.parserClass}, localCtx))
      .append(CanonicalizerRunner.create({source: config.source}, localCtx))
      .append(sharedPath);

  // URL fetching pipeline for Blink repository.
  if (config.source === WebPlatformEngine.BLINK) {
    var innerCtx = ctx.__subContext__.createSubContext({
      source: WebPlatformEngine.SPECIFICATION,
//      registry: foam.box.SelectorRegistry.create({
//        selector: FetchSpecRegistrySelector.create(null, ctx),
//      }, ctx),
    });

    var blinkPL = PipelineBuilder.create(null, innerCtx)
        .append(FetchSpecRunner.create(null, innerCtx))
        .append(IDLFragmentExtractorRunner.create(null, innerCtx))
        .append(ParserRunner.create(null, innerCtx))
        .append(CanonicalizerRunner.create({
          source: WebPlatformEngine.SPECIFICATION,
        }, innerCtx))
        .append(sharedPath)
        .build();
    config.urlOutputBox = blinkPL;
  }
  config.fileOutputBox = corePath.build();
  config.include = include;
  config.exclude = exclude;

  // Removing properties to prevent warning from FOAM.
  delete config.parserClass;
  delete config.source;

  // Start pipeline.
  LocalGitRunner.create(config, localCtx).run();
});
