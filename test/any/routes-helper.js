// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Scrape of some simple routes from chromium.googlesource.com for testing.

global.test_routes = {
  // org.chromium.idl.BlinkIDLFileDAO.BRANCH_TO_COMMIT
  "https://chromium.googlesource.com/chromium/src/+/master?format=JSON": ")]}'\n{\n  \"commit\": \"baa83b7646d435d777a587963ae45a76bcecf857\",\n  \"tree\": \"f09dcb5e52b35a520788d926476c6a1c2c887492\",\n  \"parents\": [\n    \"5513e50629e5cb3d2bea187c6c8eaab7922c5fdf\"\n  ],\n  \"author\": {\n    \"name\": \"eugenebut\",\n    \"email\": \"eugenebut@chromium.org\",\n    \"time\": \"Mon Mar 27 17:10:28 2017\"\n  },\n  \"committer\": {\n    \"name\": \"Commit bot\",\n    \"email\": \"commit-bot@chromium.org\",\n    \"time\": \"Mon Mar 27 17:10:28 2017\"\n  },\n  \"message\": \"Cancel request if user rejected form repost.\\n\\nThis makes Chrome for iOS to behave like all other browsers.\\n\\nBUG\\u003d290085\\n\\nReview-Url: https://codereview.chromium.org/2773193002\\nCr-Commit-Position: refs/heads/master@{#459808}\\n\",\n  \"tree_diff\": [\n    {\n      \"type\": \"modify\",\n      \"old_id\": \"2c598cf670da7d25ef49e6b33cddd0924ec0536a\",\n      \"old_mode\": 33188,\n      \"old_path\": \"ios/chrome/browser/web/forms_egtest.mm\",\n      \"new_id\": \"2210492ffa19019a3b7cd16d853daf33248f394a\",\n      \"new_mode\": 33188,\n      \"new_path\": \"ios/chrome/browser/web/forms_egtest.mm\"\n    },\n    {\n      \"type\": \"modify\",\n      \"old_id\": \"c8b1ccdeaa1e63cbec56dbf7f6979a91105611c5\",\n      \"old_mode\": 33188,\n      \"old_path\": \"ios/web/web_state/ui/crw_web_controller.mm\",\n      \"new_id\": \"49d815b9631088b98cc12ad6a45c58318bda4703\",\n      \"new_mode\": 33188,\n      \"new_path\": \"ios/web/web_state/ui/crw_web_controller.mm\"\n    }\n  ]\n}\n",
  // org.chromium.idl.BlinkIDLFileDAO.CODE_SEARCH_QUERY_URL
  "https://cs.chromium.org/codesearch/json/search_request:1?search_request=b&query=file%3Athird_party%2FWebKit%2FSource.*idl%24+-file%3A%2Ftesting%2F+-file%3A%2Fbindings%2Ftests%2F&max_num_results=2000&internal_options=b&internal_options=e&search_request=e": {
    maybe_skipped_documents: false,
    results_offset: 0,
    estimated_total_number_of_results: 1,
    search_result: [
      {top_file: {file: {name: 'src/some/WebPlatformAPI.idl'}}},
    ],
  },
  // Gitiles link contents
  "https://chromium.googlesource.com/chromium/src/+/baa83b7646d435d777a587963ae45a76bcecf857/some/WebPlatformAPI.idl":
  typeof window === 'undefined' ? (new Buffer("// WebPlatformAPI IDL file contents")).toString('base64') : btoa("// WebPlatformAPI IDL file contents"),
};

global.fakeHTTPRoutes = function(ctx, opt_routeMap) {
  var routMap = opt_routeMap || global.test_routes;
  foam.CLASS({
    name: 'FakeHTTPRequest',
    package: 'org.chromium.webidl.crawlers.test',
    extends: 'foam.net.HTTPRequest',

    properties: [
      {
        name: 'routes',
        value: global.test_routes,
      },
    ],

    methods: [
      function send() {
        if (!this.url)
          throw new Error('FakeHTTPRequest expects URL-based construction');

        var payload = this.routes[this.url];
        if (!payload) {
          return Promise.resolve(this.HTTPResponse.create({
            status: 404,
            payload: Promise.resolve('Not found'),
          }));
        }

        return Promise.resolve(this.HTTPResponse.create({
          status: 200,
          payload: payload,
        }));
      },
    ],
  });
  ctx.register(
      ctx.lookup('org.chromium.webidl.crawlers.test.FakeHTTPRequest'),
      'foam.net.HTTPRequest');
};
