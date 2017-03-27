// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'GitilesRequest',

  documentation: 'A Gitiles JSON API request.',

  requires: [
    'foam.net.HTTPRequest',
    'org.chromium.webidl.crawlers.GitilesRequestType',
  ],

  properties: [
    {
      class: 'String',
      name: 'baseURL',
      value: 'https://chromium.googlesource.com/chromium/src/+',
    },
    {
      class: 'String',
      name: 'commit',
      value: 'master',
    },
    {
      class: 'String',
      name: 'path',
    },
    {
      class: 'Enum',
      of: 'org.chromium.webidl.crawlers.GitilesRequestType',
      name: 'type',
      factory: function() { return this.GitilesRequestType.DIR; },
    },
  ],

  methods: [
    {
      name: 'getMachineURL',
      documentation: `Get the URL to the machine-readable form of the
        resource.`,
      code: function() { return this.type.getMachineURL(this); },
    },
    {
      name: 'getHumanURL',
      documentation: 'Get the URL to the human-readable form of the resource.',
      code: function() {
        return `${this.baseURL}/${this.commit}/${this.path}`;
      },
    },
    {
      name: 'subdir',
      documentation: 'Builder pattern for appending directory names.',
      code: function() {
        foam.assert(this.type !== this.GitilesRequestType.FILE,
                    'Cannot append directory suffix to file request.');
        var clone = this.clone();
        return clone.subdir_.apply(clone, arguments);
      },
    },
    {
      name: 'file',
      documentation: 'Builder pattern for appending file name.',
      code: function file(name) {
        foam.assert(this.type !== this.GitilesRequestType.FILE,
                    'Cannot append file suffix to file request.');
        return this.clone().file_(name);
      },
    },
    {
      name: 'send',
      documentation: `Send request and return a promise for payload contents.
        Unexpected response code or serialization error yields a promise
        rejection.`,
      code: function() {
        return this.HTTPRequest.create({
          url: this.getMachineURL(),
          responseType: 'text', // Security prefix yields malformed JSON.
        }).send().then(this.onResponse).then(this.onPayload);
      },
    },

    function subdir_() {
      for (var i = 0; i < arguments.length; i++) {
        this.path += `${arguments[i]}/`;
      }
      return this;
    },
    function file_(name) {
      this.type = this.GitilesRequestType.FILE;
      this.path += name;
      return this;
    }
  ],

  listeners: [
    function onResponse(response) {
      if (response.status !== 200) {
        throw new Error(`Unexpected response code, ${response.status}, from
          Gitiles request: ${this.getMachineURL()}`);
      }
      return response.payload;
    },
    function onPayload(payload) {
      return this.type.deserialize(payload);
    },
  ],
});
