// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'HTMLFileContent',
  documentation: 'stores the html file and the tags of interest found',
  requires: [
    'foam.parsers.html.HTMLLexer'
  ],

  properties: [
    {
      name: 'file',
      // description: 'content of the HTML file',
      postSet: function(_, file) {
        this.idlFragments = this.parse(file);
      }
    },
    {
      name: 'idlFragments',
      // description: 'all idlFragments found in the parsed HTML file',
      postSet: function(_, fragments) {
        var Parser = foam.lookup('org.chromium.webidl.Parser');
        var parser = Parser.create();
        var asts = [];

        fragments.forEach(function(idl) {
          var parsedContent = parser.parseString(idl);
          if (parsedContent.pos !== idl.length) {
            console.warn('Incomplete parse!');
          } else {
            asts.push(parsedContent.value);
          }
        });
      }
    },
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

      var idlFragments = [];        // Processed output
      var tagStack = [];            // Used for tag matching.
      var tagMatching = true;       // true: not inside a pre of interest
      var exclude = false;
      var content = '';             // Used to group together related content
      for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var isTag = lexer.Tag.isInstance(item);

        if (!tagMatching) {
          // Ignoring all tags. Only extracting text within pre tags.
          if (isTag && item.nodeName === 'pre') {
            tagMatching = true;
            tagStack.pop();
            idlFragments.push(content);
            content = '';
          } else {
            content += isTag ? '' : item;
          }
        } else if (isTag) {
          var top = tagStack[tagStack.length - 1];
          var classes = [];
          // Extract 'class' from attributes
          item.attributes.some(function(attr) {
            if (attr.name === 'class') {
              classes = attr.value.split(' ');
              return;
            }
          });

          var isIDL = classes.includes('idl');
          var isExcludeTag = classes.includes('example') || classes.includes('note');

          if (item.type.name === OPEN) {
            if (isExcludeTag) {
              exclude = true;
            } else if (!exclude && item.nodeName === 'pre' && isIDL) {
              // Found a <pre class="idl.*">.
              // Ignore tags and only extract text now.
              tagMatching = false;
            }
            tagStack.push(item);
          } else if (top && item.type.name === CLOSE && top.nodeName === item.nodeName) {
            if (isExcludeTag) exclude = false;
            tagStack.pop();
          } else {
            // Mismatched close tags and OPEN_CLOSE tags are ignored
          }
        }
      }
      return idlFragments;
    },
  ]
});

