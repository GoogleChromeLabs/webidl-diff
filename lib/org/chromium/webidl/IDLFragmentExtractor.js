// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFragmentExtractor',
  documentation: 'Extracts IDL Fragments from HTML files.',
  requires: [
    'foam.parsers.html.HTMLLexer',
    'foam.parsers.html.TagType',
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
      var lexer = this.HTMLLexer.create();
      var OPEN = this.TagType.OPEN.name;
      var CLOSE = this.TagType.CLOSE.name;
      var extractAttr = function(node, attrName) {
        var retVal = [];
        node.attributes.forEach(function(attr) {
          if (attr.name === attrName) {
            retVal = retVal.concat(attr.value.split(' '));
          }
        });
        return retVal;
      };

      var results = lexer.parseString(this.file.contents).value;
      if (!results) throw "IDL Parse was not successful.";

      var idlFragments = [];
      var tagStack = [];            // Used for tag matching.
      var excludeStack = [];        // Used for tracking excluded (example/note) tags.
      var tagMatching = true;       // Set whe not inside a pre tag of interest.
      var content = '';             // Used to group together related content.
      for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var isTag = lexer.Tag.isInstance(item);

        // FUTURE: Handle nested pre tags.
        // As of this writing, there has not been any IDL fragments
        // that has been found within nested pre tags.
        if (!tagMatching) {
          // Ignoring all tags. Only extracting text content within pre tags.
          if (isTag) {
            if (item.nodeName === 'pre') {
              tagMatching = true;
              tagStack.pop();
              idlFragments.push(lexer.lib.unescapeString(content));
              content = '';
            }
          } else {
            // item is text fragments, so we append it.
            content += item;
          }
        } else if (isTag) {
          // Encountered a tag and we are tag matching.
          // Perform appropriate action based on class attribute and tagType.
          var top = tagStack[tagStack.length - 1];
          var classes = extractAttr(item, 'class');
          var isIDL = classes && classes.includes('idl');
          var isExcluded = function(cls) {
            return cls && (cls.includes('example') || cls.includes('note'));
          };

          if (item.type.name === OPEN) {
            if (isExcluded(classes)) {
              // Entering the body of an excluded tag.
              excludeStack.push(item);
            } else if (excludeStack.length === 0
                && item.nodeName === 'pre' && isIDL) {
              // Found a <pre class="idl.*">.
              // Ignore tags and only extract text now.
              tagMatching = false;
            }
            tagStack.push(item);
          } else if (top && item.type.name === CLOSE
              && top.nodeName === item.nodeName) {
            // Item is a close tag matching the tag at the top of the stack.
            // Aliasing for readability.
            var openTag = top;
            var closeTag = item;

            var openTagCls = extractAttr(openTag, 'class');
            var excludeStackTop = excludeStack[excludeStack.length - 1];
            if (isExcluded(openTagCls) &&
                closeTag.nodeName === excludeStackTop.nodeName) {
              excludeStack.pop();
            }
            tagStack.pop();
          } else {
            // Mismatched close tags and OPEN_CLOSE tags are ignored.
          }
        }
      }
      return idlFragments;
    },
  ],
});

