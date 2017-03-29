// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.crawlers',
  name: 'GitilesCrawler',

  documentation: 'A directory crawler over the Gitiles JSON API.',

  requires: [
    'org.chromium.webidl.crawlers.GitilesRequest',
    'org.chromium.webidl.crawlers.GitilesRequestBuilder',
    'org.chromium.webidl.crawlers.GitilesRequestType',
    'org.chromium.webidl.crawlers.RateLimitDecorator',
    'org.chromium.webidl.crawlers.RateLimiter',
    'org.chromium.webidl.crawlers.RetryDecorator',
  ],
  exports: ['rateLimiter'],

  topics: [
    'start',
    'file',
    'end',
  ],

  properties: [
    {
      class: 'String',
      name: 'baseURL',
      value: 'https://chromium.googlesource.com/chromium/src/+'
    },
    {
      class: 'String',
      name: 'commit',
      value: 'master'
    },
    {
      class: 'String',
      name: 'basePath',
      value: 'third_party/WebKit/Source/',
      preSet: function(_, nu) {
        if (nu.charAt(nu.length - 1) !== '/') return nu + '/';
        return nu;
      },
    },
    {
      class: 'Function',
      name: 'acceptDir',
      value: function() { return true; },
    },
    {
      class: 'Function',
      name: 'acceptFile',
      value: function() { return true; },
    },
    {
      class: 'FObjectProperty',
      of: 'org.chromium.webidl.crawlers.RateLimiter',
      name: 'rateLimiter',
      factory: function() {
        return this.RateLimiter.create();
      },
    },
    {
      class: 'Function',
      name: 'requestFactory',
      factory: function() {
        return function(builder) {
          return builder.type === this.GitilesRequestType.FILE ?
            this.RateLimitDecorator.create({
              delegate: this.RetryDecorator.create({
                delegate: this.GitilesRequest.create({
                  baseURL: builder.baseURL,
                  commit: builder.commit,
                  path: builder.path,
                  type: builder.type,
                }),
              }),
            }) : this.RetryDecorator.create({
              delegate: this.GitilesRequest.create({
                baseURL: builder.baseURL,
                commit: builder.commit,
                path: builder.path,
                type: builder.type,
              }),
            });
        }.bind(this);
      },
    },
    {
      class: 'Int',
      name: 'semaphore_',
    },
  ],

  methods: [
    {
      name: 'run',
      documentation: `Run this crawler. Crawl directories nad files under
        "basePath". Skip directories that return falsey from "acceptDir", and
        publish only files that return truthy on "acceptFile".`,
      code: function() {
        var self = this;
        self.start.pub();
        this.incWork_();
        self.branchToCommit_().then(this.onReadyToCrawl);
      },
    },
    {
      name: 'crawlDir',
      documentation: 'Crawl directory associated with input.',
      code: function(builder) {
        if (!this.acceptDir(builder.path)) return;
        this.incWork_();
        builder.build().send().then(this.onDir.bind(this, builder));
      },
    },
    {
      name: 'crawlFile',
      documentation: 'Crawl directory associated with input.',
      code: function(builder) {
        if (!this.acceptFile(builder.path)) return;
        this.incWork_();
        builder.build().send().then(this.onFile.bind(this, builder));
      },
    },

    function branchToCommit_() {
      var self = this;
      return self.GitilesRequest.create({
        baseURL: self.baseURL,
        commit: self.commit,
        path: self.basePath,
        type: self.GitilesRequestType.COMMIT,
      }).send().then(function(json) {
        self.commit = json.commit;
        return self;
      });
    },
    function incWork_() {
      foam.assert(this.semaphore_ >= 0, 'Semaphore must be >= 0 on increment.');
      this.semaphore_++;
    },
    function decWork_() {
      foam.assert(this.semaphore_ > 0, 'Semaphore must be > 0 on decrement.');
      this.semaphore_--;
      if (this.semaphore_ === 0) this.end.pub();
    },
  ],

  listeners: [
    function onReadyToCrawl() {
      this.crawlDir(this.GitilesRequestBuilder.create({
        baseURL: this.baseURL,
        commit: this.commit,
        path: this.basePath,
        requestFactory: this.requestFactory,
      }));
      this.decWork_();
    },
    function onDir(builder, json) {
      var entries = json.entries;
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.type === 'tree') this.crawlDir(builder.subdir(entry.name));
        else this.crawlFile(builder.file(entry.name));
      }
      this.decWork_();
    },
    function onFile(builder, str) {
      this.file.pub({path: builder.path, contents: str});
      this.decWork_();
    }
  ],
});
