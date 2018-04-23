// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.manualFetchAndParseTest = function(configPath, description) {
  describe(description, function() {
    var oldContext;
    var config;
    var LocalGitRunner;
    var Parser;
    var execSync = require('child_process').execSync;
    var originalTimeout;
    var outputBox;
    var errorBox;
    var failedFiles = [];

    beforeAll(function() {
      // Creating new context for AccumulatorBox to be defined in.
      oldContext = foam.__context__;
      foam.__context__ = foam.createSubContext({});
      global.defineAccumulatorBox();

      config = require(configPath).config;
      LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
      Parser = config.parserClass;
      
      var AccumulatorBox = foam.lookup('org.chromium.webidl.test.AccumulatorBox');
      outputBox = AccumulatorBox.create();
      errorBox = AccumulatorBox.create();

      // Adjust config for LocalGitRunner usage.
      config.fileOutputBox = outputBox;
      config.errorBox = errorBox;
      delete config.source;
      delete config.parserClass;

      // Creating temporary directory for repo files.
      // execSync returns a Buffer with a new line character.
      config.localRepositoryPath = execSync('mktemp -d').toString().trim(-1);

      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    });

    afterAll(function() {
      // Reset context and clean up repo data.
      foam.__context__ = oldContext;
      execSync(`/bin/rm -rf "${config.localRepositoryPath}"`);

      if (failedFiles.length !== 0) {
        console.log(`
            The following files failed to parse for this repository:`);
        failedFiles.forEach(function(file) {
          console.log(file);
        });
      }
    });

    it('should fetch git repo and send files to outputBox', function(done) {
      var onDone = function() {
        console.log(`Found ${outputBox.results.length} results`);
        expect(outputBox.results.length > 0).toBe(true);
        expect(errorBox.results.length).toBe(0);
        done();
      }.bind(this);

      config.onDone = onDone;
      LocalGitRunner.create(config).run();
    });

    it('should produce valid parse trees from fetched files', function(done) {
      var parser = Parser.create();
      var results = outputBox.results;

      results.forEach(function(result) {
        var idl = result.contents;
        var parse = parser.parseString(idl, 'Test');
        if (parse.pos !== idl.length) failedFiles.push(result.metadata.path);
        expect(parse.pos).toBe(idl.length);
        expect(parse.value).toBeDefined();
      }.bind(this));
      done();
    });
  });
};
