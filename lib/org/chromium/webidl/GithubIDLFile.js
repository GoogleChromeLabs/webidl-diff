// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'GithubIDLFile',
  extends: 'org.chromium.webidl.IDLFile',

  documentation: 'An IDL file accessible via Github.',

  properties: [
    {
      class: 'String',
      name: 'githubBaseURL',
    },
    {
      class: 'String',
      name: 'rawURL',
      expression: function(githubBaseURL, revision, path) {
        return `${githubBaseURL}/raw/${revision}/${path}`;
      },
    },
    {
      class: 'String',
      name: 'documentURL',
      expression: function(githubBaseURL, revision, path) {
        return `${githubBaseURL}/blob/${revision}/${path}`;
      },
    },
  ],
});
