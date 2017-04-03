// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'BlinkIDLFileDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO of Gitiles-backed web platform IDL files from Blink.',

  requires: [
    'foam.dao.InternalException',
    'foam.dao.MDAO',
    'foam.net.HTTPRequest',
    'org.chromium.webidl.GitilesIDLFile',
  ],

  constants: {
    branchToCommitURL: 'https://chromium.googlesource.com/chromium/src/+/master?format=JSON',
    gitilesBaseURL: 'https://chromium.googlesource.com/chromium/src/+',
    maxNumResults: 2000, // Assumed loose upper bound on number of IDL files.
    repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
  },

  properties: [
    {
      name: 'of',
      value: 'org.chromium.webidl.GitilesIDLFile',
    },
    {
      name: 'delegate',
      factory: function() {
        return this.MDAO.create({of: this.of});
      },
    },
    {
      class: 'String',
      documentation: 'Git commit hash that DAO points to.',
      name: 'commit',
    },
    {
      class: 'Boolean',
      documentation: `Internal state: Is the DAO ready to accept operations?
        May throw a foam.dao.InternalException. To automatically catch retry
        when not ready, wrap this DAO in a StoreAndForwardDAO.`,
      name: 'isReady_',
    },
    {
      class: 'String',
      name: 'codeSearchQueryURL',
      factory: function() {
        // NOTE: This API uses a brittle protobuf. Query parameters cannot be
        // re-ordered.
        return 'https://cs.chromium.org/codesearch/json/search_request:1?search_request=b&query=file%3Athird_party%2FWebKit%2FSource.*idl%24+-file%3A%2Ftesting%2F+-file%3A%2Fbindings%2Ftests%2F' +
            '&max_num_results=' + this.MAX_NUM_RESULTS +
            '&internal_options=b&internal_options=e&search_request=e';
      },
    },
  ],

  methods: [
    function init() {
      this.branchToCommit_().then(this.onCommitSet);
    },
    function put(obj) {
      return this.checkNotReady_() || this.delegate.put(obj);
    },
    function remove(obj) {
      return this.checkNotReady_() || this.delegate.remove(obj);
    },
    function find(objOrId) {
      return this.checkNotReady_() || this.delegate.find(objOrId);
    },
    function select(sink, skip, limit, order, predicate) {
      return this.checkNotReady_() ||
          this.delegate.select(sink, skip, limit, order, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.checkNotReady_() ||
          this.delegate.removeAll(skip, limit, order, predicate);
    },

    {
      name: 'checkNotReady_',
      documentation: `Return an InternalException promise rejection iff DAO is
        not ready to accept operations yet. Otherwise, return false.`,
      code: function() {
        if (this.isReady_) return false;

        // Reject on internal exception when not ready. By default, this will be
        // retried by a StoreAndForwardDAO.
        return Promise.reject(this.InternalException.create());
      },
    },
    {
      name: 'branchToCommit_',
      documentation: `Convert the branch baked into BRANCH_TO_COMMIT_URL into
        a commit hash, and store it in this.commit.`,
      code: function() {
        var self = this;
        return self.HTTPRequest.create({
          url: self.BRANCH_TO_COMMIT_URL,
          responseType: 'text', // Security prefix yields malformed JSON.
        }).send().then(function(response) {
          if (response.status !== 200) throw response;
          return response.payload;
        }).then(function(payload) {
          var json = JSON.parse(payload.substr(4)); // Skip security prefix.
          self.commit = json.commit;
          return self;
        });
      },
    },
  ],

  listeners: [
    function onCommitSet() {
      var self = this;
      return self.HTTPRequest.create({
        url: self.codeSearchQueryURL,
        responseType: 'json',
      }).send().then(function(response) {
        if (response.status !== 200) throw response;
        return response.payload;
      }).then(function(json) {
        if (json.search_response.length !== 1)
          throw new Error('Unexpected multi-part search_response from Chromium Code Search');
        var data = json.search_response[0];
        if (data.maybe_skipped_documents)
          throw new Error('Some Chromium Code Search results may have been skipped');
        if (data.results_offset !== 0)
          throw new Error('Chromium Code Search skipped some results');
        if (data.estimated_total_number_of_results !== data.search_result.length)
          throw new Error('Chromium Code Search result set incomplete');

        var files = data.search_result;
        var initData = {
          repository: self.REPOSITORY_URL,
          gitilesBaseURL: self.GITILES_BASE_URL,
          revision: self.commit,
        };

        var promises = [];
        for (var i = 0; i < files.length; i++) {
          // substr(4): Omit "src/" prefix.
          initData.path = files[i].top_file.file.name.substr(4);
          promises.push(self.delegate.put(
              self.GitilesIDLFile.create(initData)));
        }
        return Promise.all(promises);
      }).then(function() {
        self.isReady_ = true;
      });
    },
  ],
});
