// Copyright 2017 The Chromium Authors. ALl rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

global.DIFF_CREATE_MAP = function(Parser, IDLFileContents, idl, opt_source) {
  opt_source = opt_source || 'Test';

  var map = {};
  var sourceId = IDLFileContents.create({id: opt_source});
  var results = Parser.create().parseString(idl, sourceId).value;
  // If tests fails here, then the given fragment has syntax error.
  expect(results.length > 0).toBe(true);

  results.forEach(function(result) {
    map[result.id] = result;
  });
  return map;
};
