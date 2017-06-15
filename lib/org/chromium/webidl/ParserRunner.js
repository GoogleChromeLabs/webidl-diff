// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'ParserRunner',
  extends: 'foam.box.Runnable',

  documentation: 'Runnable Box that parsers IDLFileContents into ASTs',

  methods: [
    function run(args) {
      var file = args.file;
      var parser = args.parser;
      if (!file || !parser) throw "Parser runner requires a file and parser as arguments!"

      // Load appropriate parser depending on configuration
      var parser = foam.lookup(`org.chromium.webidl.${parser}`).create();
      args.ast = parser.parseString(file.contents).value;
      this.output(args);
    }
  ],
});
