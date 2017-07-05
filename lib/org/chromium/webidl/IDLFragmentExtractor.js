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
      name: 'tags',
      expression: function(file) {
        var results = this.lexer_.parseString(file.contents).value;
        if (!results)
          throw new Error("IDLFragmentExtractor: IDL Parse was not successful.");
        return results;
      },
    },
    {
      name: 'idlFragments',
      documentation: 'All IDL Fragments found in the parsed HTML file.',
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
      name: 'noMatchingAction',
      documentation: 'Action performed when tag matching is not performed.',
      code: function(i, idlFragments) {
        var content = '';   // Used to group together related content.
        var incomplete = true;

        while(incomplete) {
          var item = this.tags[++i];
          var isTag = this.lexer_.Tag.isInstance(item);

          // FUTURE: Handle nested pre tags.
          // As of this writing, there has not been any IDL fragments
          // that has been found nested within other pre tags.
          if (isTag && item.nodeName === 'pre') {
            this.tagStack_.pop();
            idlFragments.push(content);
            incomplete = false;
          } else if (!isTag) {
            // Ignoring all tags. Only extracting text content within pre tags.
            content += item;
          }
        }
        return i;
      },
    },
    {
      name: 'extract',
      documentation: 'Extracts all IDL Fragments from file property.',
      code: function() {
        var OPEN = this.TagType.OPEN.name;
        var CLOSE = this.TagType.CLOSE.name;
        var results = this.tags;
        var tagStack = this.tagStack_;

        var idlFragments = [];
        var content = '';             // Used to group together related content.
        for (var i = 0; i < results.length; i++) {
          var item = results[i];
          var isTag = this.lexer_.Tag.isInstance(item);

          // FUTURE: Handle nested pre tags.
          // As of this writing, there has not been any IDL fragments
          // that has been found within nested pre tags.
          if (!this.tagMatching_) {
            // Ignoring all tags. Only extracting text content within pre tags.
            if (isTag) {
              if (item.nodeName === 'pre') {
                this.tagMatching_ = true;
                tagStack.pop();
                idlFragments.push(this.lexer_.lib.unescapeString(content));
                content = '';
              }
            } else {
              // item is text fragments, so we append it.
              content += item;
            }
          } else if (isTag) {
            // Encountered a tag and we are tag matching.
            // Perform appropriate action based on class attribute and tagType.
            var top = tagStack.top;

            if (item.type.name === OPEN) {
              this.openTagAction(item);
/*
              if (this.tagMatching_ === false) {
                i = this.noMatchingAction(i, idlFragments);
                this.tagMatching_ = true;
              }
*/
            } else if (top && item.type.name === CLOSE && top.nodeName === item.nodeName) {
              // Item is a close tag matching the tag at the top of the stack.
              tagStack.pop();
            } else if (top && item.type.name === CLOSE &&
                tagStack.count(item.nodeName) !== 0) {
              // Item is a close tag but does not match tag at top of the
              // stack. However, there is a matching tag somewhere on the stack.
              // Pop all tags until we reach it.
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
        return idlFragments;
      },
    }
  ],
});

