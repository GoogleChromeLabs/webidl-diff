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
      class: 'Array',
      of: 'String',
      documentation: 'Array of IDL Fragments found in the parsed HTML file.',
      name: 'idlFragments',
    },
    {
      class: 'Array',
      name: 'tags_',
      documentation: 'Array of HTML tags and text fragments to be processed.',
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
      documentation: `A state variable that changes as extract processes a file.
        Tag matching is turned off (false) upon entering a pre tag with class idl
        and turned back on (true) upon completing the parse of the pre block.
        true: the tags within the file will be considered.
        false: The tags will be ignored and only text fragments are extracted.`,
      value: true,
    },
  ],

  methods: [
    {
      name: 'extractTags',
      documentation: 'Extracts an array of tags from an HTML file.',
      code: function(file) {
        var results = this.lexer_.parseString(file.contents).value;
        if (!results)
          throw new Error(`IDLFragmentExtractor: HTML Lexer failed to parse document. URL: ${file.url}`);
        return results;
      },
    },
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
      documentation: `Determines if tag has class names that excludes the tag
         and the descendants from IDL extraction.`,
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
      documentation: `Action performed upon encountering an open <pre> token.
        Extraction begins at ith tag and extracts text contents until a
        closing pre tag is encountered. If ignore is false, the extracted
        text content is pushed into idlFragments. The function always returns
        the index of the last processed element.`,
      code: function(i, ignore) {
        var content = '';   // Used to group together related content.
        var incomplete = true;

        while (incomplete) {
          var item = this.tags_[++i];
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
            // Item is a text fragment since it is not a tag, so we append it.
            content += item;
          }
        }
        return i;
      },
    },
    {
      name: 'resetState_',
      documentation: 'Resets the states used during extraction.',
      code: function() {
        this.idlFragments = [];
        this.tags_ = [];
        this.tagStack_ = this.TagStack.create({ isExcluded: this.isExcluded });
        this.tagMatching_ = true;
      }
    },
    {
      name: 'extract',
      documentation: 'Extracts all IDL Fragments from file property.',
      code: function(file) {
        // Ensure the states are reset before proceeding.
        this.resetState_();

        var OPEN = this.TagType.OPEN.name;
        var CLOSE = this.TagType.CLOSE.name;
        var tagStack = this.tagStack_;
        var ignoreNextPre = false;    // Set to ignore content of next pre tag.

        // Prepare HTML file for processing.
        this.tags_ = this.extractTags(file);

        for (var i = 0; i < this.tags_.length; ++i) {
          var item = this.tags_[i];
          var isTag = this.lexer_.Tag.isInstance(item);

          if (!isTag) continue;

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
              i = this.extractPreContents(i, ignoreNextPre);

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
        return this.idlFragments;
      },
    },
  ],
});
