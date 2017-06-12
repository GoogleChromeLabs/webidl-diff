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

var URLExtractor = foam.lookup('org.chromium.webidl.URLExtractor');
var HTMLFileContents = foam.lookup('org.chromium.webidl.HTMLFileContents');
var LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
var ParserRunner = foam.lookup('org.chromium.webidl.ParserRunner')

// Preparing pipelines
var ctx = foam.box.Context.create();
var PipelineBuilder = foam.box.pipeline.PipelineBuilder;
var builder = PipelineBuilder.create(null, ctx);

// Pipeline Description
// Fetch from Repositories -> Extract IDL Files -> Process into IDLFileContents
//
//           (Blink) 1-> Extract URLs -> Fetch HTML -> Process IDL Files -> ...
// ->Branch{
//           (Other) 2-> To Datastore -> ...
// -> Put partials together -> Diff -> Back to datastore

//var firstSharedPL = builder.then(LocalGitRunner.create());

//var blinkIntermPL = firstSharedPL.then(URLExtractor...);
//var corePipeline = firstSharedPL.then(ParserRunner.create());


var firstSharedPL = builder.then(LocalGitRunner.create())
                           .then(ParserRunner.create()) // Temporarily placed here..
                           .build();


// Convert to build all eventually...
// var boxes = builder.buildAll();
// Blink Pipeline
firstSharedPL.send(foam.box.Message.create({ object: { config: blinkConfig, freshRepo: false } }));

// Gecko Pipeline
//firstSharedPL.send(foam.box.Message.create({ object: { config: geckoConfig, freshRepo: false } }));

// Webkit Pipeline
//firstSharedPL.send(foam.box.Message.create({ object: { config: webKitConfig, freshRepo: false } }));


//var IDLFiles = foam.dao.EasyDAO.create({of: IDLFileContents, delegate: foam.dao.ArrayDAO.create()});
//var HTMLFiles = foam.dao.EasyDAO.create({of: HTMLFileContents, delegate: foam.dao.ArrayDAO.create()});
//var arr = [];

/*
// We fetch the files and perform ...
[ blinkConfig, geckoConfig, webKitConfig ].forEach(function(config) {
  localGitRunner(config).select().then(function(data) {
    var dat = data.array;
    if (config.name === 'blinkConfig') {
      var urls = [];

      // We need to extract URLs and have another pipeline.
      dat.forEach(function(item) {
        urls = urls.concat(URLExtractor.create({file: item}).extract() || []);
      });

      // Dedup URL array, then fetch
      urls = urls.filter(function(url, index, self) {
        return self.indexOf(url) === index;
      });

      // Fetch and create HTML file content for each URL
      urls.forEach(function(url) {
        HTTPRequest.create({url: url}).send().then(function(response) {
          if (response.status !== 200) throw response;
          response.payload.then(function(payload) {
            var file = HTMLFileContents.create({
              url: url,
              timestamp: new Date(),
              content: payload
            });
            HTMLFiles.put(file);
          });
        });
      });
    }
    var y = data;
  });
});
*/
