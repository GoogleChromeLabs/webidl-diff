// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.chromium.webidl',
  name: 'DiffStatus',

  values: [
    {
      name: 'LEFT_MISSING_DEFINITION',
      label: 'Left missing definition',
    },
    {
      name: 'RIGHT_MISSING_DEFINITION',
      label: 'Right missing definition',
    },
  ],
});

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Diff',

  requires: [
    'org.chromium.webidl.ast.Definition',
    'org.chromium.webidl.ast.DefinitionData',
    'org.chromium.webidl.ast.Enum',
    'org.chromium.webidl.ast.ExtendedAttributes',
    'org.chromium.webidl.ast.Identifier',
    'org.chromium.webidl.ast.Interface',
    'org.chromium.webidl.ast.Member',
    'org.chromium.webidl.DiffChunk',
    'org.chromium.webidl.DiffStatus',
  ],

  documentation: 'The diff algorithm.',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.chromium.webidl.DiffChunk',
      name: 'chunks',
    },
    {
      name: 'DefinitionProps_',
      factory: function() {
        var excludeProps = [ 'id', 'sources' ];
        return this.Definition.getAxiomsByClass(foam.core.Property)
            .filter(function(prop) {
              return !excludeProps.includes(prop.name);
            });
      },
    },
    {
      name: 'EnumProps_',
      factory: function() {
        var excludeProps = [ 'isPartial', 'isCanonical' ];
        return this.Enum.getAxiomsByClass(foam.core.Property)
            .filter(function(prop) {
              return !excludeProps.includes(prop.name);
            });
      },
    },
  ],

  methods: [
    function addChunk_(name, status, path, left, right) {
      this.chunks.push(this.DiffChunk.create({
        name: name,
        status: status,
        propPath: path,
        leftKey: left,
        leftValue: left,
        rightKey: right,
        rightValue: right,
      }));
    },
    function diff(left, right) {
      // Left and right should be maps of definitions.
      // Determine union of leftKeys and rightKeys.
      var leftKeys = Object.keys(left);
      var rightKeys = Object.keys(right);
      var keys = leftKeys.concat(rightKeys);
      keys = keys.filter(function(key, index) {
        return keys.indexOf(key) === index;
      });

      // Iterate through keys and perform diff between each.
      keys.forEach(function(key) {
        var leftObj = left[key];
        var rightObj = right[key];

        if (!leftObj) {
          this.addChunk_(key, this.DiffStatus.LEFT_MISSING_DEFINITION, null, leftObj, rightObj);
        } else if (!rightObj) {
          this.addChunk_(key, this.DiffStatus.RIGHT_MISSING_DEFINITION, null, leftObj, rightObj);
        } else {
          var id = { name: key, path: '' };
          this.definitionCmp_(leftObj, rightObj, id);
        }
      }.bind(this));

      // Return value back to caller.
      return this.chunks;
    },
    function dispatch_(left, right, field, id) {
      // Check left and right for the field.
      // Ensure that the types match.
      // If not match, handle that case... :(
      var leftVal = left[field];
      var rightVal = right[field];
      var isLeftArray = Array.isArray(leftVal);
      var isRightArray = Array.isArray(rightVal);

      if (isLeftArray && isRightArray) {
      } else if (isLeftArray !== isRightArray) {
        // One is an array, one is not... We return diff chunk.
        this.addChunk_(id.name, 'Mismatch array / obj?', id.path, left, right);
      } else {
        var leftCls = leftVal ? leftVal.cls_.name : null;
        var rightCls = rightVal ? rightVal.cls_.name : null;

        if (leftCls !== rightCls) {
          if (!leftCls || !rightCls) {
            // One of the definitions is missing this field.
            this.addChunk_(id.name, `Missing ${field}.`, id.path, left, right);
            return;
          }
          // We have different classes for this field for some reason!
          throw new Error('WHAT?! CLASS ERROR');
        }

      // Update path.
      id.path += `.${field}`;

      // Array of things...
      var isLeftArray = Array.isArray(left);
      var isRightArray = Array.isArray(right);
      if (isLeftArray && isRightArray) {
      } else if (isLeftArray !== isRightArray) {
        // One is an array, one is not... We return diff chunk.
        this.addChunk_(id.name, 'Mismatch array / obj?', id.path, left, right);
      } else {
        // Handle single items / objects.
        var fn;
        switch (leftCls) {
          case 'Definition':
            fn = this.definitionCmp_;
            break;
          case 'DefinitionData':
            fn = this.definitionDataCmp_;
            break;
          case 'Enum':
            fn = this.enumCmp_;
            break;
          case 'ExtendedAttributes':
            fn = this.extendedAttrsCmp_;
            break;
          case 'Identifier':
            fn = this.identifierCmp_;
            break;
          case 'Interface':
            fn = this.interfaceCmp_;
            break;
          case 'Member':
            fn = this.memberCmp_;
          default:
        };

        if (!fn) throw new Error('Unable to handle this.');
        fn = fn.bind(this);
        fn(leftVal, rightVal, id);
      }
    },
    function definitionCmp_(left, right, id) {
      // Left and right should be AST nodes of type Definition.
      foam.assert(this.Definition.isInstance(left));
      foam.assert(this.Definition.isInstance(right));

      // Properties to consider: ExtendedAttrs, Members, etc.
      this.DefinitionProps_.forEach(function(prop) {
        this.dispatch_(left, right, prop, id);
      }.bind(this));
    },
    function definitionDataCmp_(left, right, id) {
      // Left and right should be AST nodes of type DefinitionData.
      foam.assert(this.DefinitionData.isInstance(left));
      foam.assert(this.DefinitionData.isInstance(right));

      //...
    },
    function enumCmp_(left, right, id) {
      // Left and right should be AST nodes of type Enum.
      foam.assert(this.Enum.isInstance(left));
      foam.assert(this.Enum.isInstance(right));

      // Properties to consider: Members, Name.
      this.EnumProps_.forEach(function(prop) {
        this.dispatch_(left, right, prop, id);
      });
    },
    function extendedAttrsCmp_(left, right, id) {
      // Expect to receive extended attributes.
      //
    },
    function identifierCmp_(left, right, id) {
      // Expect to receive identifiers.
      foam.assert(this.Identifier.isInstance(left));
      foam.assert(this.Identifier.isInstance(right));

      // Properties to consider: literal
      this.IdentifierProps_.forEach(function(prop) {
        if (prop.name === 'literal') {
          if (left[prop] !== right[prop]) {
            this.addChunk_(id.name, 'DIFFERENT LITERAL', id.path, left, right);
          }
        }

        this.dispatch_(left, right, prop, id);
      });
    },
    function interfaceCmp_(left, right, id) {
      foam.assert(this.Interface.isInstance(left));
      foam.assert(this.Interface.isInstance(right));

      // Things to compare:
      // members : Array<member>
      // inheritsFrom : ?
      // name: Identifier
      // isPartial: Boolean

    },
    function memberCmp_(left, right, id) {
      // Left and right should be AST nodes of type Members.
      foam.assert(this.Member.isInstance(left));
      foam.assert(this.Member.isInstance(right));
    },
    function membersCmp_(left, right, id) {
      // Is there a smart way to compare array of members?!
    },
  ],
});
