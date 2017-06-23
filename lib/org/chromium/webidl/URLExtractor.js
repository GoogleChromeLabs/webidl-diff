// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'URLExtractor',

  requires: ['org.chromium.webidl.IDLFileContents'],

  properties: [
    {
      name: 'exclude',
      // documentation: 'Excludes all URLs matching this array of expressions.',
      postSet: function(_, value) {
        var exps = value.map(function(item) {
          return item.source;
        });
        this.excludeRegexp_ = exps.join('|');
      },
    },
    {
      name: 'include',
      // documentation: 'Only include URLs matching this array of expressions.',
      postSet: function(_, value) {
        var exps = value.map(function(item) {
          return item.source;
        });
        this.includeRegexp_ = exps.join('|');
      },
    },
    {
      name: 'excludeRegexp_',
    },
    {
      name: 'includeRegexp_'
    },
  ],

  constants: {
    URL_REGEX: /https?:\/\/[^#, \n]+/g,
  },

  methods: [
    function extract(file) {
      if (this.IDLFileContents.isInstance(file)) {
        var urls = file.contents.match(this.URL_REGEX) || [];

        var includeExp = this.includeRegexp_;
        var excludeExp = this.excludeRegexp_;

        return urls.filter(function(url) {
          return (includeExp === undefined || !!url.match(includeExp)) &&
              (excludeExp === undefined ||  !url.match(excludeExp));
        });
      }
    },
  ]
});
