// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('LocalGitRunner test', function() {
  var LocalGitRunner;

  beforeEach(function() {
    LocalGitRunner = foam.lookup('org.chromium.webidl.LocalGitRunner');
  });

  it('should throw an error if run() is called with no arugments', function() {
    var runner = LocalGitRunner.create();
    expect(function() { runner.run(); })
      .toThrow(new Error("LocalGitRunner: Missing configuration file!"));
  });

  it('should throw an error if run() is called with invalid arguments', function() {
    var runner = LocalGitRunner.create();
    expect(function() { runner.run("Hello world!"); })
      .toThrow(new Error("LocalGitRunner: Missing configuration file!"));
  });

  it('should throw an error if run() is called with improper config file', function() {
    var args = { config: {}};
    var runner = LocalGitRunner.create();
    expect(function() { runner.run(args); })
      .toThrow(new Error("LocalGitRunner: Invalid configuration file"));
  });
});
