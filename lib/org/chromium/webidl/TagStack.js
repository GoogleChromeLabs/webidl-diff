// Copyright 2017 The Chromium AUthors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'TagStack',
  documentation: 'A modified stack data structure used for HTML Tag matching.',

  properties: [
    {
      name: 'isExcluded',
      documentation: 'Function injected by user to determine if tag is excluded.',
      value: function() {
        return false;
      },
    },
    {
      class: 'Array',
      of: 'foam.parsers.html.Tag',
      documentation: 'Stack of HTML Tags.',
      name: 'tags_',
    },
    {
      class: 'Array',
      of: 'foam.parsers.html.Tag',
      documentation: 'Stack of excluded HTML Tags.',
      name: 'excludedTags_',
    },
    {
      name: 'tagCounter_',
      factory: function() { return {}; },
    },
    {
      name: 'top',
      getter: function() {
        return this.tags_[this.length - 1] || null;
      },
    },
    {
      name: 'excludedTop',
      getter: function() {
        return this.excludedTags_[this.excludedTags_.length - 1] || null;
      },
    },
    {
      name: 'length',
      getter: function() {
        return this.tags_.length;
      },
    },
  ],

  methods: [
    function push(tag) {
      this.tags_.push(tag);
      this.tagCounter_[tag.nodeName] = ++this.tagCounter_[tag.nodeName] || 1;

      if (this.isExcluded(tag)) {
        this.excludedTags_.push(tag);
      }
    },
    function pop() {
      var retVal = this.tags_.pop();
      this.tagCounter_[retVal.nodeName]--;
      if (this.tagCounter_[retVal.nodeName] < 0) throw new Error("LESS THAN 0?");

      if (this.excludedTop && this.excludedTop.nodeName === retVal.nodeName) {
        this.excludedTags_.pop();
      }
      return retVal;
    },
    function count(nodeName) {
      return this.tagCounter_[nodeName] || 0;
    },
  ],
});
