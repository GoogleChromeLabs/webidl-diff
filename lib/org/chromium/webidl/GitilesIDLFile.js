// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'GitilesIDLFile',
  extends: 'org.chromium.webidl.IDLFile',

  documentation: 'An IDL file accessible via Gitiles.',

  properties: [
    {
      class: 'String',
      name: 'gitilesBaseURL',
    },
    {
      class: 'String',
      name: 'rawURL',
      expression: function(gitilesBaseURL, revision, path) {
        return `${gitilesBaseURL}/${revision}/${path}?format=TEXT`;
      },
    },
    {
      class: 'String',
      name: 'documentURL',
      expression: function(gitilesBaseURL, revision, path) {
        return `${gitilesBaseURL}/${revision}/${path}`;
      },
    },
    {
      class: 'Function',
      documentation: 'Base64-string decode',
      name: 'atob',
      factory: function() {
        // TODO(markdittmer): More elegant Node vs. browser detection.
        return foam.isServer ?
            function atobNode(str) {
              return new Buffer(str, 'base64').toString();
            } : atob;
      },
    },
  ],

  methods: [
    function fetch() {
      return this.SUPER().then(this.atob);
    },
  ],
});
