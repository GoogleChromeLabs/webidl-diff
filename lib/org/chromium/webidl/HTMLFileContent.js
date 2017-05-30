// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'HTMLFileContent',

  requires: [
    'foam.parsers.HTMLLexer'
  ],

  properties: [
    {
      name: 'file',
      // description: 'content of the HTML file',
      postSet: function(_, file) {
        this.pre = this.parse(file);
      }
    },
    {
      name: 'pre',
      // description: 'all pre tags found in the parsed HTML file',
    }
  ],

  methods: [
    function parse(str) {
      var self = this;
      var lexer = self.HTMLLexer.create();
      var OPEN = lexer.TagType.OPEN.name;
      var CLOSE = lexer.TagType.CLOSE.name;
      var OPEN_CLOSE = lexer.TagType.OPEN_CLOSE.name;

      var results = lexer.parseString(str).value;

      // Tag matching
      // Using a stack to obtain ancestorOf <pre class=idl> tags
      var tags = [];
      var pre = [];

      // We ignore tags inside <* class="example"> or <* class="note">
      // skipStack keeps track of stack levels where tags are of the above
      var skipStack = [];

      results.forEach(function(node, i) {
        var item = results[i];

        if (foam.core.FObject.isInstance(item)) {
          var top = tags[tags.length - 1];
          var classes = '';
          item.attributes.forEach(function(attr) {
            if (attr.name === 'class') {
              classes = attr.value.split(' ');
            }
          });

          if (item.type.name === OPEN) {
            if (classes.includes('example') || classes.includes('note')) {
              skipStack.push(tags.length);
            }
            tags.push(item);
          } else if (top !== undefined && item.nodeName === top.nodeName
              && item.type.name === CLOSE) {
            tags.pop();
            if (skipStack[skipStack.length - 1] == tags.length) {
              skipStack.pop();
            }
          } else if (item.type.name === OPEN_CLOSE && item.nodeName === 'pre' &&
              skipStack.length === 0) {
            var isIDL = classes.includes('idl');

            // Add to the list of pre.
            pre.push({
              ancestor: top,
              content: self.flatten(item.content),
              isIDL: isIDL
            });
          } else {
            // Currently not doing anything for:
            //  - Nested pre tags in example/note
            //  - OPEN_CLOSE tags that are not pre
            //  - Malformed / Mismatched HTML Files
          }
        }
      });
      return pre;
    },

    function flatten(obj) {
      var self = this;
      return obj.reduce(function(acc, item) {
        if (foam.String.isInstance(item)) {
          return acc.concat(item);
        } else if (foam.core.FObject.isInstance(item)) {
          return acc.concat(foam.Array.isInstance(item.content) ?
              item.content[1] || item.content[0] : '');
        }
      }, "");
    }
  ]
});

