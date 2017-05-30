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
      factory: function() { return new Array; }
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
      results.forEach(function(node, i) {
        var item = results[i];

        if (foam.core.FObject.isInstance(item)) {
          var top = tags[tags.length - 1];
          if (top === undefined || item.type.name === OPEN) {
            tags.push(item);
          } else if (item.nodeName === top.nodeName && item.type.name === CLOSE) {
            // Do we need to do anything with this?
            tags.pop();
          } else if (item.type.name === OPEN_CLOSE && item.nodeName === 'pre') {
            // Determine if node is of class IDL
            var isIDL = false;
            item.attributes.forEach(function(attr) {
              if (attr.name === 'class' && attr.value.split(' ').includes('idl')) {
                isIDL = true;
              }
            });

            // Add to the list of pre
            pre.push({
              ancestor: top,
              content: self.flatten(item.content),
              isIDL: isIDL
            });
          } else {
            // Currently not doing anything for:
            //  - Self closing tags (item.type.name === OPEN_CLOSE)
            //  - Malformed / Mismatched HTML Files
          }
        }
      });

      if (tags.length !== 0) {
        // We have mismatched tags! :(
      }
      return pre;
    },

    function flatten(obj) {
      var self = this;
      return obj.reduce(function(acc, item) {
        if (foam.String.isInstance(item)) {
          return acc.concat(item);
        } else if (foam.core.FObject.isInstance(item)) {
          return acc.concat(foam.Array.isInstance(item.content) ?
              item.content[1] || item.content[0] || '' : '');
        }
      }, "");
    }
  ]
});

