// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractor',
  documentation: 'extracts IDL Fragments from HTML files',
  requires: [
    'foam.parsers.html.HTMLLexer'
  ],

  properties: [
    {
      name: 'file',
      of: 'org.chromium.webidl.HTMLFileContent',
      postSet: function(_, file) {
        this.idlFragments = this.extract();
      },
    },
    {
      name: 'idlFragments',
      // description: 'all idlFragments found in the parsed HTML file',
    },
  ],

  methods: [
    function extract() {
      var self = this;
      var lexer = self.HTMLLexer.create();
      var OPEN = lexer.TagType.OPEN.name;
      var CLOSE = lexer.TagType.CLOSE.name;
      var extractAttr = function(node, attrName) {
        var retVal;
        node.attributes.some(function(attr) {
          if (attr.name === attrName) {
            retVal = attr.value.split(' ');
          }
        });
        return retVal;
      };

      var results = lexer.parseString(self.file.content).value;

      var idlFragments = [];
      var tagStack = [];            // Used for tag matching.
      var excludeStack = [];        // Used for tracking excluded (example/note) tags.
      var tagMatching = true;       // Set whe not inside a pre tag of interest.
      var content = '';             // Used to group together related content.
      for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var isTag = lexer.Tag.isInstance(item);

        if (!tagMatching) {
          // Ignoring all tags. Only extracting text within pre tags.
          if (isTag && item.nodeName === 'pre') {
            tagMatching = true;
            tagStack.pop();
            idlFragments.push(lexer.lib.unescapeString(content));
            content = '';
          } else {
            content += isTag ? '' : item;
          }
        } else if (isTag) {
          var top = tagStack[tagStack.length - 1];
          var classes = extractAttr(item, 'class');
          var isIDL = classes && classes.includes('idl');
          var isExcluded = function(cls) {
            return cls && (cls.includes('example') || cls.includes('note'));
          };

          if (item.type.name === OPEN) {
            if (isExcluded(classes)) {
              excludeStack.push(item);
            } else if (excludeStack.length === 0 && item.nodeName === 'pre' && isIDL) {
              // Found a <pre class="idl.*">.
              // Ignore tags and only extract text now.
              tagMatching = false;
            }
            tagStack.push(item);
          } else if (top && item.type.name === CLOSE && top.nodeName === item.nodeName) {
            var parentCls = extractAttr(top, 'class');
            var excludeStackTop = excludeStack[excludeStack.length - 1];
            if (isExcluded(parentCls) && item.nodeName === excludeStackTop.nodeName) {
              excludeStack.pop();
            }
            tagStack.pop();
          } else {
            // Mismatched close tags and OPEN_CLOSE tags are ignored.
          }
        }
      }
      return idlFragments;
    }
  ]
});

