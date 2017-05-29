// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'HTMLParser',

  requires: [
    'foam.parsers.HTMLLexer'
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
              var x = tags.pop();
            } else if (item.type.name === OPEN_CLOSE && item.nodeName === 'pre') {
              // Process the IDL body
              var idl = self.flatten(item.content);

              var value = {
                ancestor: top,
                idl: idl
              };
              pre.push(value);
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

