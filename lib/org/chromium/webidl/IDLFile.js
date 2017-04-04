// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFile',
  extends: 'org.chromium.webidl.IDLFileBase',

  documentation: 'An IDL file that can be fetched via HTTP.',

  requires: ['foam.net.HTTPRequest'],

  methods: [
    {
      name: 'fetch',
      returns: 'Promise',
      documentation: 'Fetch the raw contents of this IDL file.',
      code: function() {
        return this.HTTPRequest.create({url: this.rawURL}).send()
            .then(function(response) {
              if (response.status !== 200) throw response;
              return response.payload;
            });
      },
    },
  ],
});
