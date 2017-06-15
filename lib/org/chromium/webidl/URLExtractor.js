// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'URLExtractor',

  properties: [
    {
      name: 'excludeRegexp',
    },
    {
      name: 'includeRegexp',
    }
  ],

  constants: {
    URL_REGEX: /https?:\/\/[^/]+(\/[^?#, \n]*)?(\?[^#, \n]*)?/g,
  },

  methods: [
    function extract(file) {
      if (file) {
        var urls = file.contents.match(this.URL_REGEX) || [];

        // Process the URLs based on include/exclude RegExp
        var includeExp = this.includeRegexp;
        var excludeExp = this.excludeRegexp;

        return urls.filter(function(url) {
          return !!url.match(includeExp) && !url.match(excludeExp);
        });
      }
    },
  ]
});
