// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl.crawlers',
  name: 'GitilesRequestType',

  documentation: 'Enum values for a type of Gitiles HTTP request.',

  requires: ['org.chromium.webidl.crawlers.GitilesRequestTypeValue'],

  properties: [
    {
      class: 'String',
      documentation: 'The URL query string associated with a request type.',
      name: 'query',
    },
    {
      class: 'Function',
      documentation: "Deserialization routine for request type's response.",
      name: 'deserialize',
    },
    {
      class: 'Function',
      documentation: `Get the machine-readable URL associated with the input,
        where the request type is "this".`,
      name: 'getMachineURL',
    },
  ],

  values: [
    {
      class: 'org.chromium.webidl.crawlers.GitilesRequestTypeValue',
      name: 'DIR',
      label: 'Directory',
      query: '?format=JSON',
      deserialize: function(almostJSON) {
        return JSON.parse(almostJSON.substr(4)); // Skip security prefix.
      },
      getMachineURL: function(req) {
        return `${req.baseURL}/${req.commit}/${req.path}${this.query}`;
      },
    },
    {
      class: 'org.chromium.webidl.crawlers.GitilesRequestTypeValue',
      name: 'FILE',
      label: 'File',
      query: '?format=TEXT',
      deserialize: (function() {
        // TODO(markdittmer): Cleaner browser/NodeJS interop.
        return typeof atob === 'undefined' ?
            function nodeJSDeserialize(base64str) {
              return new Buffer(base64str, 'base64').toString();
            } : function browserDeserialize(base64str) {
              return atob(base64str);
            };
      })(),
      getMachineURL: function(req) {
        return `${req.baseURL}/${req.commit}/${req.path}${this.query}`;
      },
    },
    {
      class: 'org.chromium.webidl.crawlers.GitilesRequestTypeValue',
      name: 'COMMIT',
      label: 'Commit',
      query: '?format=JSON',
      deserialize: function(almostJSON) {
        return JSON.parse(almostJSON.substr(4)); // Skip security prefix.
      },
      getMachineURL: function(req) {
        return `${req.baseURL}/${req.commit}${this.query}`;
      },
    },
  ],
});
