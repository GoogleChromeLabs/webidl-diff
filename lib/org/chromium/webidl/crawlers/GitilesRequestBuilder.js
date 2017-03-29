// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'GitilesRequestBuilder',

  documentation: 'Builder pattern for a Gitiles JSON API request.',

  requires: [
    'org.chromium.webidl.crawlers.GitilesRequest',
    'org.chromium.webidl.crawlers.GitilesRequestType',
  ],

  properties: [
    {
      class: 'Function',
      documentation: `Factory for constructing (potentially decorated)
        requests. May be a  bound function, so builder is passed in as a
        parameter.`,
      name: 'requestFactory',
      value: function(builder) {
        return this.GitilesRequest.create({
          baseURL: builder.baseURL,
          commit: builder.commit,
          path: builder.path,
          type: builder.type,
        });
      },
    },
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
      name: 'path'
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
      code: function(name) {
        foam.assert(this.type !== this.GitilesRequestType.FILE,
                    'Cannot append file suffix to file request.');
        return this.clone().file_(name);
      },
    },
    {
      name: 'build',
      documentation: 'Produce request.',
      code: function() {
        return this.requestFactory(this);
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
});
