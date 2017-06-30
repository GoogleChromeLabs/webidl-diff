// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'URLExtractor',

  properties: [
    {
      class: 'Array',
      of: 'RegExp',
      name: 'exclude',
      documentation: 'Excludes all URLs matching this array of RegExp.',
    },
    {
      class: 'Array',
      of: 'RegExp',
      name: 'include',
      documentation: 'Only include URLs matching this array of RegExp.',
    },
    {
      name: 'excludeRegexp_',
      expression: function(exclude) {
        if (Array.isArray(exclude) && exclude.length > 0) {
          var exps = exclude.map(function(exp) {
            return exp.source;
          });
          return new RegExp(exps.join('|'));
        }
        return null;
      },
    },
    {
      name: 'includeRegexp_',
      expression: function(include) {
        if (Array.isArray(include) && include.length > 0) {
          var exps = include.map(function(exp) {
            return exp.source;
          });
          return new RegExp(exps.join('|'));
        }
        return null;
      },
    },
  ],

  constants: {
    URL_REGEX: /https?:\/\/[^#, \n]+/g,
  },

  methods: [
    function extract(contents) {
      if (typeof contents === 'string') {
        var urls = contents.match(this.URL_REGEX) || [];
        var includeExp = this.includeRegexp_;
        var excludeExp = this.excludeRegexp_;

        return urls.filter(function(url) {
          return (includeExp === null || !!url.match(includeExp)) &&
              (excludeExp === null ||  !url.match(excludeExp));
        });
      }
    },
  ]
});
