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
    'org.chromium.webidl.TagStack',
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
      class: 'Array',
      of: 'String',
      documentation: 'Array of IDL Fragments found in the parsed HTML file.',
      name: 'idlFragments',
    },
    {
      name: 'tags_',
      documentation: 'Array of tags extracted from file to be processed.',
      expression: function(file) {
        var results = this.lexer_.parseString(file.contents).value;
        if (!results)
          throw new Error("IDLFragmentExtractor: IDL Parse was not successful.");
        // Reversing array so we can use pop(). More efficient than shift().
        return results.reverse();
      },
    },
    {
      name: 'lexer_',
      factory: function() { return this.HTMLLexer.create(); },
    },
    {
      name: 'tagStack_',
      documentation: 'Stack used to perform HTML Tag matching.',
      factory: function() {
        return this.TagStack.create({ isExcluded: this.isExcluded });
      },
    },
    {
      name: 'tagMatching_',
      documentation: 'Used to determine if tag matching is currently performed.',
      value: true,
    },
  ],

  methods: [
    {
      name: 'extractAttr',
      documentation: 'Extracts given attribute from tag.',
      code: function(tag, attrName) {
        var retVal = [];
        tag.attributes.forEach(function(attr) {
          if (attr.name === attrName) {
            retVal = retVal.concat(attr.value.split(' '));
          }
        });
        return retVal;
      },
    },
    {
      name: 'isExcluded',
      documentation: 'Determines if tag has excluded classes.',
      code: function(tag) {
        var cls = [];
        tag.attributes.forEach(function(attr) {
          if (attr.name === 'class') {
            cls = cls.concat(attr.value.split(' '));
          }
        });
        return cls.includes('example') || cls.includes('note');
      },
    },
    {
      name: 'openTagAction',
      documentation: 'Action performed when an open HTML tag is encountered.',
      code: function(tag) {
        var top = this.tagStack_.top;
        var excludedTop = this.tagStack_.excludedTop;

        var classes = this.extractAttr(tag, 'class');
        var isIDL = classes && classes.includes('idl');

        // HACK: Top level tags can be unmatched as well. One noticeable example
        // is <p>. However, <div> cannot nest within <p>, so if we see an open
        // <div> tag while <p> is on top of the stack, we pop <p>.
        if (top && top.nodeName === 'p' && tag.nodeName === 'div') {
          this.tagStack_.pop();
        }

        if (this.tagStack_.excludedTop === null && tag.nodeName === 'pre' && isIDL) {
          // Found a <pre class="idl.*">.
          // Ignore tags and only extract text now.
          this.tagMatching_ = false;
        }
        this.tagStack_.push(tag);
      },
    },
    {
      name: 'extractPreContents',
      documentation: 'Action performed when extracting contents inside pre tag.',
      code: function(ignore) {
        var content = '';   // Used to group together related content.
        var incomplete = true;

        while(incomplete) {
          var item = this.tags_.pop();
          var isTag = this.lexer_.Tag.isInstance(item);

          // FUTURE: Handle nested pre tags.
          // As of this writing, there has not been any IDL fragments
          // that has been found nested within other pre tags.
          if (isTag && item.nodeName === 'pre') {
            this.tagStack_.pop();
            incomplete = false;

            if (!ignore) {
              this.idlFragments.push(this.lexer_.lib.unescapeString(content));
            }
          } else if (!isTag) {
            // Ignoring all tags. Only extracting text content within pre tags.
            content += item;
          }
        }
      },
    },
    {
      name: 'extract',
      documentation: 'Extracts all IDL Fragments from file property.',
      code: function() {
        var OPEN = this.TagType.OPEN.name;
        var CLOSE = this.TagType.CLOSE.name;
        var tagStack = this.tagStack_;
        var ignoreNextPre = false;    // Set to ignore content of next pre tag.

        while(this.tags_.length > 0) {
          var item = this.tags_.pop();
          var isTag = this.lexer_.Tag.isInstance(item);

          if (isTag) {
            // Encountered a tag and we are tag matching.
            // Perform appropriate action based on tagType.
            var top = tagStack.top;

            // TODO: Replace with more elegant solution
            // Currently ignoring the pre body immediately following
            // a tag with id of 'idl-index'.
            var id = this.extractAttr(item, 'id');
            if (id.includes('idl-index')) {
              ignoreNextPre = true;
            }

            if (item.type.name === OPEN) {
              this.openTagAction(item);

              if (this.tagMatching_ === false) {
                this.extractPreContents(ignoreNextPre);

                // Reset state to perform default action.
                ignoreNextPre = false;
                this.tagMatching_ = true;
              }
            } else if (top && item.type.name === CLOSE &&
                top.nodeName === item.nodeName) {
              // Item is a close tag matching the tag at the top of the stack.
              tagStack.pop();
            } else if (top && item.type.name === CLOSE &&
                tagStack.count(item.nodeName) !== 0) {
              // Item is a close tag, not matching tag at top of the stack.
              // However, there exists a matching tag somewhere on the stack.
              // Pop all items until we reach that matching opening tag.
              while(top.nodeName !== item.nodeName) {
                tagStack.pop();
                top = tagStack.top;
              }
              // Pop once more, since we "matched" with this tag
              tagStack.pop();
            } else {
              // Unmatched CLOSE tags and OPEN_CLOSE tags are ignored.
            }
          }
        }
        return this.idlFragments;
      },
    }
  ],
});

