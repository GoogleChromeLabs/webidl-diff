// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'PlatformBlinkIDLFileDAO',
  extends: 'foam.dao.FilteredDAO',
  implements: ['foam.mlang.Expressions'],

  documentation: `Wrapper for org.chromium.webidl.BlinkIDLFileDAO that filters
    out IDL files that are not a part of the web platform.`,

  requires: [
    'org.chromium.webidl.BlinkIDLFileDAO',
    'org.chromium.webidl.IDLFile',
    'org.chromium.webidl.StoreAndForwardDAO',
  ],

  properties: [
    {
      name: 'of',
      value: 'org.chromium.webidl.GitilesIDLFile',
    },
    {
      name: 'delegate',
      factory: function() {
        return this.StoreAndForwardDAO.create({
          of: this.of,
          delegate: this.BlinkIDLFileDAO.create({of: this.of}),
        });
      },
    },
    {
      documentation: 'Filter predicate for Blink web platform IDL files.',
      name: 'predicate',
      factory: function() {
        var CONTAINS = function(str) {
          return this.CONTAINS(this.IDLFile.PATH, str);
        }.bind(this);

        return this.NOT(
            this.OR(
                CONTAINS('/Source/core/mojo/'),
                CONTAINS('/Source/core/testing/'),
                this.AND(
                    CONTAINS('/Source/modules/'),
                    CONTAINS('/testing/')),
                CONTAINS('/bindings/tests/')));
      },
    },
  ],
});
