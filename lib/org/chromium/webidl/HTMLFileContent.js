// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'HTMLFileContent',
  documentation: 'stores the html file and the tags of interest found',
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
      postSet: function(_, tags) {
        var Parser = foam.lookup('org.chromium.webidl.Parser');
        var parser = Parser.create();
        var asts = [];

        // Currently using generic parsers...
        tags.forEach(function(tag) {
          if (tag.isIDL) {
            var parsedContent = parser.parseString(tag.content);
            if (parsedContent.pos !== tag.content.length) {
              console.warn('Incomplete parse!');
            } else {
              asts.push(parser.parseString(tag.content).value);
            }
          }
        });
      }
    },
    // Temporarily putting this here until we know where to put it
    {
      name: 'ast',
      // description: 'ast of IDL files found in the parsed HTML file'
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

      // Tag matching to obtain ancestorOf <pre class=idl> tags
      var tags = [];
      var pre = [];

      // We ignore tags inside <* class="example"> or <* class="note">
      // skipStack keeps track of stack levels where ignored tags are located
      var skipStack = [];

      results.forEach(function(node, i) {
        var item = results[i];

        if (foam.core.FObject.isInstance(item)) {
          var top = tags[tags.length - 1];
          // Extract 'class' from attributes
          var classes = '';
          item.attributes.some(function(attr) {
            if (attr.name === 'class') {
              classes = attr.value.split(' ');
              return;
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

            pre.push({
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

    function flatten(tags) {
      // Extracts contents from an array of tags and creates
      // one resulting string.
      var self = this;
      return tags.reduce(function(acc, item) {
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

