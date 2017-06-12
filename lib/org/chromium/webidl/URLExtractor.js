// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'URLExtractor',
  axioms: [ foam.pattern.Singleton.create() ],

  constants: {
    URL_REGEX: /https?:\/\/[^/]+(\/[^?#, \n]*)?(\?[^#, \n]*)?/g,
  },

  properties: [
    {
      name: 'file',
      of: 'org.chromium.webidl.IDLFileContents',
      required: true,
    },
  ],

  methods: [
    function extract() {
      var contents = this.file.contents;
      var urls = contents.match(this.URL_REGEX);
      return urls;
    }
  ]
});
