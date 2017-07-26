// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'Parser',
  extends: 'org.chromium.webidl.BaseParser',

  documentation: `A relatively forgiving Web IDL parser.

    Based on the living Web IDL specification:
    https://heycam.github.io/webidl/`,

    axioms: [
      foam.pattern.Singleton.create(),
    ],

  requires: [
    'foam.parse.Parsers',
    'org.chromium.webidl.ast.Argument',
    'org.chromium.webidl.ast.Attribute',
    'org.chromium.webidl.ast.Callback',
    'org.chromium.webidl.ast.CallbackInterface',
    'org.chromium.webidl.ast.Const',
    'org.chromium.webidl.ast.DecInteger',
    'org.chromium.webidl.ast.Definition',
    'org.chromium.webidl.ast.Dictionary',
    'org.chromium.webidl.ast.DictionaryMemberData',
    'org.chromium.webidl.ast.EmptyArray',
    'org.chromium.webidl.ast.Enum',
    'org.chromium.webidl.ast.Exception',
    'org.chromium.webidl.ast.ExtendedAttributeArgList',
    'org.chromium.webidl.ast.ExtendedAttributeIdentList',
    'org.chromium.webidl.ast.ExtendedAttributeIdentifierOrString',
    'org.chromium.webidl.ast.ExtendedAttributeNamedArgList',
    'org.chromium.webidl.ast.ExtendedAttributeNoArgs',
    'org.chromium.webidl.ast.Float',
    'org.chromium.webidl.ast.HexInteger',
    'org.chromium.webidl.ast.Identifier',
    'org.chromium.webidl.ast.Implements',
    'org.chromium.webidl.ast.Infinity',
    'org.chromium.webidl.ast.Interface',
    'org.chromium.webidl.ast.Iterable',
    'org.chromium.webidl.ast.Literal',
    'org.chromium.webidl.ast.MapLike',
    'org.chromium.webidl.ast.Member',
    'org.chromium.webidl.ast.MemberData',
    'org.chromium.webidl.ast.Namespace',
    'org.chromium.webidl.ast.NonUnionType',
    'org.chromium.webidl.ast.OctInteger',
    'org.chromium.webidl.ast.Operation',
    'org.chromium.webidl.ast.OperationQualifier',
    'org.chromium.webidl.ast.ParameterizedType',
    'org.chromium.webidl.ast.Partial',
    'org.chromium.webidl.ast.Serializer',
    'org.chromium.webidl.ast.SerializerPattern',
    'org.chromium.webidl.ast.SerializerPatternType',
    'org.chromium.webidl.ast.SetLike',
    'org.chromium.webidl.ast.SimpleType',
    'org.chromium.webidl.ast.StaticMember',
    'org.chromium.webidl.ast.String',
    'org.chromium.webidl.ast.Stringifier',
    'org.chromium.webidl.ast.Type',
    'org.chromium.webidl.ast.TypeSuffix',
    'org.chromium.webidl.ast.Typedef',
    'org.chromium.webidl.ast.UnionType',
    'org.chromium.webidl.parsers.TokenParsers',
  ],

  properties: [
    {
      name: 'separator',
      factory: function() {
        return foam.Function.withArgs(
            function(plus0, alt, seq1, repeat0, notChars, seq) {
              return repeat0(alt(
                  // Whitespace.
                  alt(' ', '\t', '\n', '\r', '\f'),
                  // Single-line comment.
                  seq(
                      '//',
                      repeat0(notChars('\r\n')), alt('\r\n', '\n')),
                  // Multi-line comment.
                  seq1(
                      1,
                      '/*',
                      repeat0(alt(notChars('*'), seq('*', notChars('\/')))),
                      '*\/')));
            },
            this.Parsers.create(),
            this);
      },
    },
  ],

  methods: [
    function symbolsFactory() {
      return Object.assign(this.SUPER(), foam.Function.withArgs(
          function(
              sym, literal, range, str, repeat, plus, optional, alt, seq, seq1,
              notChars, trepeat, tseq1, tplus, tseq, sep) {
            return {
              // Common patterns.
              _09: range('0', '9'),
              r09: str(repeat(sym('_09'))),
              p09: str(plus(sym('_09'))),
              om: optional('-'),
              opm: optional(alt('+', '-')),
              Ee: alt('E', 'e'),
              AZ: range('A', 'Z'),
              az: range('a', 'z'),

              // Common tokens.
              integer: seq(
                  sym('om'),
                  alt(
                      sym('dec'),
                      sym('hex'),
                      sym('oct'))),
              dec: str(seq(range('1', '9'), sym('r09'))),
              hex: str(seq('0', alt('X', 'x'), str(plus(alt(
                  range('0', '9'), range('A', 'F'), range('a', 'f')))))),
              oct: str(seq('0', str(repeat(range('0', '7'))))),
              float: seq(
                  sym('om'),
                  alt(
                      str(seq(
                          alt(
                              str(seq(sym('p09'), '.', sym('r09'))),
                              str(seq('.', sym('p09')))),
                          optional(
                              str(seq(sym('Ee'), sym('opm'), sym('p09')))))),
                      str(seq(sym('p09'), sym('Ee'), sym('opm'), sym('p09'))))),

              // TODO: This has been relaxed to parse identifiers like
              // "__content" in Gecko's IDL. It should be
              // /_?[A-Za-z][0-9A-Z_a-z-]*/.
              identifier: seq(
                  alt(sym('AZ'), sym('az'), '_'),
                  str(repeat(alt(sym('AZ'), sym('az'), sym('_09'), '_', '-')))),
              string: seq1(1, '"', str(repeat(notChars('"'))), '"'),

              // NOTE: Trailing ";"s not optional in spec.
              SemiColon: optional(';'),

              // Parser's init function would take care of this for us if we
              // provided the grammar at init time.
              START: seq1(1, sep(), sym('Definitions')),

              // Definitions.
              Definitions: trepeat(tseq(
                  sym('ExtendedAttributeList'), sym('Definition'))),
              Definition: alt(
                  sym('CallbackOrInterfaceLike'),
                  sym('Namespace'),
                  sym('Partial'),
                  sym('Dictionary'),
                  sym('Enum'),
                  sym('Typedef'),
                  sym('ImplementsStatement')),

              // Callbacks and interfaces.
              CallbackOrInterfaceLike: alt(sym('Callback'),
                                           sym('InterfaceLike')),
              Callback: tseq1(1, 'callback',
                              sym('CallbackRestOrInterfaceLike')),
              // TODO: Do we have semantic actions that require this production?
              CallbackRestOrInterfaceLike: alt(
                  sym('CallbackRest'), sym('InterfaceLike')),
              InterfaceLike: tseq(
                  alt('interface', 'exception'),
                  sym('identifier'), sym('Inheritance'), '{',
                  sym('InterfaceMembers'), '}', sym('SemiColon')),
              CallbackRest: tseq(
                  sym('identifier'), '=', sym('Type'), '(', sym('ArgumentList'),
                  ')', sym('SemiColon')),
              Inheritance: optional(tseq1(1, ':', sym('identifier'))),

              // Namespaces.
              Namespace: tseq(
                  'namespace', sym('identifier'), '{', sym('NamespaceMembers'),
                  '}', sym('SemiColon')),
              NamespaceMembers: trepeat(tseq(
                  sym('ExtendedAttributeList'), sym('NamespaceMember'))),
              // NOTE: Spec uses "ReturnType" below, instead of Type. Rely on
              // semantic actions to care about the difference.
              // TODO: Namespace members should only include Operation. Const
              // added here to deal with Gecko's use of consts in "console"
              // namespace.
              NamespaceMember: alt(sym('Const'), sym('Operation')),

              // Partials.
              Partial: tseq1(1, 'partial', sym('PartialDefinition')),
              PartialDefinition: alt(
                  sym('PartialInterface'), sym('PartialDictionary'),
                  sym('Namespace')),
              PartialInterface: tseq(
                  'interface', sym('identifier'), '{', sym('InterfaceMembers'),
                  '}', sym('SemiColon')),
              PartialDictionary: tseq(
                  'dictionary', sym('identifier'), '{',
                  sym('DictionaryMembers'), '}', sym('SemiColon')),

              // Dictionaries.
              Dictionary: tseq(
                  'dictionary', sym('identifier'), sym('Inheritance'), '{',
                  sym('DictionaryMembers'),
                  '}', sym('SemiColon')),
              DictionaryMembers: trepeat(tseq(
                  sym('ExtendedAttributeList'), sym('DictionaryMember'))),
              DictionaryMember: tseq(
                  sym('Required'), sym('TypeWithExtendedAttributes'), sym('identifier'),
                  sym('Default'), sym('SemiColon')),
              Required: optional('required'),

              // Enums.
              Enum: tseq(
                  'enum', sym('identifier'), '{', sym('EnumValueList'), '}',
                  sym('SemiColon')),
              EnumValueList: trepeat(sym('string'), ','),

              // Typedefs.
              Typedef: tseq(
                  'typedef', sym('TypeWithExtendedAttributes'), sym('identifier'),
                  sym('SemiColon')),

              // Implements statements.
              ImplementsStatement: tseq(
                  sym('identifier'), 'implements', sym('identifier'),
                  sym('SemiColon')),

              // Interface members.
              InterfaceMembers: trepeat(tseq(
                  sym('ExtendedAttributeList'), sym('InterfaceMember'))),
              InterfaceMember: alt(
                  sym('Const'), sym('Serializer'), sym('Stringifier'),
                  sym('StaticMember'), sym('Operation'), sym('Iterable'),
                  sym('Member')),
              // NOTE: Type should be constrained "ConstType" from spec; rely on
              // semtantic actions to check this.
              Const: tseq(
                  'const', sym('Type'), sym('identifier'), '=',
                  sym('ConstValue'), sym('SemiColon')),
              // NOTE: Type should be constrained "ReturnType" from spec;
              // rely on semtantic actions to check this.
              Operation: tseq(sym('Specials'), sym('Type'),
                              sym('OperationRest')),
              Serializer: tseq1(1, 'serializer', sym('SerializerRest')),
              Stringifier: tseq1(1, 'stringifier', alt(
                  ';', sym('ReadOnlyAttributeRestOrOperation'))),
              StaticMember: tseq1(
                  1, 'static', sym('ReadOnlyAttributeRestOrOperation')),
              Iterable: tseq(
                  'iterable', '<', sym('TypeWithExtendedAttributes'), sym('OptionalType'), '>',
                  sym('SemiColon')),
              Member: tseq(sym('Inherit'), sym('ReadOnly'), sym('MemberRest')),
              MemberRest: alt(
                  sym('AttributeRest'), sym('MaplikeRest'), sym('SetlikeRest')),
              Inherit: optional('inherit'),
              ReadOnlyAttributeRest: tseq(sym('ReadOnly'),
                                          sym('AttributeRest')),
              ReadOnly: optional('readonly'),
              // ReadOnlyMember: tseq('readonly', sym('MemberRest')),
              // TODO: 'inherit' required to disambiguate from ReadOnlyMember?
              // Perhaps we want optional(alt(tseq('inherit', 'readonly'),
              // 'inherit')) to capture no-inherit-prefix-but-still-read-write
              // case?
              // Also, can readonly attributes be inherited? If so, shouldn't
              // they NOT be parsed as ReadWriteAttribute? Members and
              // attributes can probably be simplified radically by simply
              // supporting optional qualifiers before AttributeRest and
              // Map/Set-likes. Check BNF and web IDL tests to confirm.
              // ReadWriteMember: tseq(sym('ReadOnly'),
              //                       sym('AttributeRest')),
              // Inherit: optional('inherit'),
              // TODO: Do we need this? Semantic action that differentiates
              // between these and their "rest"s?  ReadWriteMaplike:
              // sym('MaplikeRest'), ReadWriteSetlike: sym('SetlikeRest'),

              // Within interface members.
              Specials: trepeat(alt(
                  'getter', 'setter', 'deleter', 'legacycaller',
                  // TODO: "creator" is a proprietary extension used by
                  // Gecko.
                  'creator')),
              OperationRest: tseq(
                  optional(sym('identifier')), '(', sym('ArgumentList'), ')',
                  sym('SemiColon')),
              SerializerRest: alt(
                  sym('SerializerRestOperation'), sym('SerializerRestPattern'),
                  sym('SerializerRestEmpty')),
              SerializerRestOperation: tseq(
                  optional(sym('Type')), sym('OperationRest')),
              SerializerRestPattern: tseq1(1, '=', sym('SerializationPattern'),
                                           sym('SemiColon')),
              SerializerRestEmpty: literal(';'),
              SerializationPattern: alt(
                  tseq('{', sym('SerializationPatternInner'), '}'),
                  tseq('[', sym('SerializationPatternInner'), ']'),
                  sym('identifier')),
              // Spec has different patterns for SerializationPatternMap and
              // SerializationPatternList. We just include all of them here
              // (which is technically too permissive).
              SerializationPatternInner: optional(alt(
                  'getter', sym('IdentifierList'))),
              // NOTE: "ReturnType" in spec.
              ReadOnlyAttributeRestOrOperation: alt(
                  sym('ReadOnlyAttributeRest'), sym('Operation')),
              // NOTE: Spec says AttributeName (identifier below) is:
              // (AttributeNameKeyword|identifier) and that
              // AttributeNameKeyword is: "required". Leave this to semantic
              // actions.
              AttributeRest: tseq(
                  'attribute', sym('TypeWithExtendedAttributes'), sym('identifier'),
                  sym('SemiColon')),
              MaplikeRest: tseq(
                  'maplike', '<', sym('TypeWithExtendedAttributes'), ',',
                  sym('TypeWithExtendedAttributes'), '>', sym('SemiColon')),
              SetlikeRest: tseq1(
                  2, 'setlike', '<', sym('TypeWithExtendedAttributes'), '>', sym('SemiColon')),

              // Identifiers and arguments.
              IdentifierList: tplus(sym('identifier'), ','),
              ArgumentList: trepeat(sym('Argument'), ','),
              Argument: tseq(sym('ExtendedAttributeList'),
                             sym('OptionalOrRequiredArgument')),
              OptionalOrRequiredArgument: alt(
                  sym('OptionalArgument'), sym('RequiredArgument')),
              OptionalArgument: tseq(
                  'optional', sym('TypeWithExtendedAttributes'), sym('ArgumentName'), sym('Default')),
              RequiredArgument: tseq(sym('Type'), sym('Ellipsis'),
                                     sym('ArgumentName')),
              Default: optional(tseq1(
                  1, '=', alt(sym('ConstValue'), sym('string'),
                              sym('ArrayValue')))),
              ArrayValue: tseq('[', ']'),
              // NOTE: Should be (ArgumentNameKeyword|identifier); we leave
              // dealing with keywords to semantic actions.
              ArgumentName: sym('identifier'),
              Ellipsis: optional('...'),

              // Values.
              // NOTE: This approximates the union of a bunch of literals. The -
              // identifier part is for literals like "-Infinity".
              ConstValue: alt(
                  sym('ConstValueCornerCase'), sym('float'), sym('integer'),
                  sym('identifier')),
              ConstValueCornerCase: tseq('-', sym('identifier')),

              // Types.
              // NOTE: We don't parse the type name "any" specially. This means
              // that we may, for example, parse "any<Foo>" as a type, though
              // it's not allowed.
              Type: alt(sym('UnionType'), sym('NonUnionType')),
              TypeWithExtendedAttributes: alt(
                  tseq(sym('ExtendedAttributeList'), sym('UnionType')),
                  tseq(sym('ExtendedAttributeList'), sym('NonUnionType'))),
              UnionType: tseq(
                  '(', tplus(sym('UnionMemberType'), 'or'), ')',
                  sym('TypeSuffixes')),
              // NOTE: We support nesting of union types, though the standard
              // does not.
              UnionMemberType: alt(sym('UnionType'),
                  tseq(sym('ExtendedAttributeList'), sym('NonUnionType'))),
              NonUnionType: alt(sym('ParameterizedType'), sym('SimpleType')),
              ParameterizedType: tseq(
                  sym('SimpleType'), '<', tplus(sym('Type'), ','), '>',
                  sym('TypeSuffixes')),
              SimpleType: tseq(
                  alt(sym('BuiltInTypeName'), sym('identifier')), sym('TypeSuffixes')),
              // Approximation of multi-token built-in type names.
              // TODO: Parse this correctly.
              BuiltInTypeName: tplus(alt(
                  'unsigned', 'short', 'long', 'unrestricted', 'float',
                  'double', 'byte', 'octet')),
              // TODO: Make this production more comprehensible.
              // It allows for a series of "[]" and "?" with no "??"s.
              TypeSuffixes: optional(alt(
                  tseq(
                      sym('Nullable'), optional(tseq(sym('Array'),
                                                     sym('TypeSuffixes')))),
                  tseq(sym('Array'), optional(sym('TypeSuffixes'))))),
              Nullable: literal('?'),
              Array: tseq('[', ']'),
              OptionalType: optional(tseq(',', sym('TypeWithExtendedAttributes'))),

              // Extended attributes.
              ExtendedAttributeList: optional(
                  tseq1(1, '[', trepeat(sym('ExtendedAttribute'), ','), ']')),
              ExtendedAttribute: alt(
                  sym('ExtendedAttributeIdentList'),
                  sym('ExtendedAttributeNamedArgList'),
                  sym('ExtendedAttributeIdentifierOrString'),
                  sym('ExtendedAttributeArgList'),
                  sym('ExtendedAttributeNoArgs')),
              ExtendedAttributeIdentList: tseq(
                  sym('identifier'), '=', '(', sym('IdentifierOrStringList'),
                  ')'),
              ExtendedAttributeNamedArgList: tseq(
                  sym('identifier'), '=', sym('identifier'), '(',
                  sym('ArgumentList'),
                  ')'),
              ExtendedAttributeIdentifierOrString: tseq(
                  sym('identifier'), '=', sym('IdentifierOrString')),
              ExtendedAttributeStr: tseq(
                  sym('identifier'), '=', sym('string')),
              ExtendedAttributeArgList: tseq(
                  sym('identifier'), '(', sym('ArgumentList'), ')'),
              ExtendedAttributeNoArgs: sym('identifier'),

              IdentifierOrString: alt(sym('identifier'), sym('string')),
              IdentifierOrStringList: tplus(sym('IdentifierOrString'), ','),
            };
          },
          this.TokenParsers.create({separator: this.separator}),
          this));
    },
    function actionsFactory() {
      var parser = this;
      return Object.assign(this.SUPER(), {
        Definitions: parser.extAttrAndValue(parser.Definition, 'definition'),
        Callback: function(v) {
          if (parser.Callback.isInstance(v)) return v;
          return parser.CallbackInterface.create({interface: v});
        },
        InterfaceLike: function(v) {
          return (v[0] === 'interface' ? parser.Interface : parser.Exception)
              .create({name: v[1], inheritsFrom: v[2], members: v[4]});
        },
        CallbackRest: function(v) {
          return parser.Callback.create({
            name: v[0],
            returnType: v[2],
            args: v[4],
          });
        },
        Namespace: function(v) {
          return parser.Namespace.create({name: v[1], members: v[3]});
        },
        NamespaceMembers: parser.extAttrAndValue(parser.Member, 'member'),
        Partial: function(v) {
          v.isPartial = true;
          return v;
        },
        PartialInterface: function(v) {
          return parser.Interface.create({
            name: v[1],
            members: v[3],
            isPartial: true,
          });
        },
        PartialDictionary: function(v) {
          return parser.Dictionary.create({
            name: v[1],
            members: v[3],
            isPartial: true,
          });
        },
        Dictionary: function(v) {
          return parser.Dictionary.create({
            name: v[1],
            inheritsFrom: v[2],
            members: v[4],
          });
        },
        DictionaryMembers: parser.extAttrAndValue(parser.Member, 'member'),
        DictionaryMember: function(v) {
          return parser.DictionaryMemberData.create({
            isRequired: v[0] !== null,
            type: v[1],
            name: v[2],
            value: v[3],
          });
        },
        Enum: function(v) {
          return parser.Enum.create({name: v[1], members: v[3]});
        },
        Typedef: function(v) {
          return parser.Typedef.create({type: v[1], name: v[2]});
        },
        ImplementsStatement: function(v) {
          return parser.Implements.create({
            implementer: v[0],
            implemented: v[2],
          });
        },
        InterfaceMembers: parser.extAttrAndValue(parser.Member, 'member'),
        Const: function(v) {
          return parser.Const.create({
            type: v[1],
            name: v[2],
            value: v[4],
          });
        },
        Operation: function(v) {
          v[2].qualifieres = v[0];
          v[2].returnType = v[1];
          return v[2];
        },
        Specials: function(v) {
          var OQ = parser.OperationQualifier;
          for (var i = 0; i < v.length; i++) {
            switch (v[i]) {
              case 'getter':
              v[i] = OQ.GETTER;
              break;
              case 'setter':
              v[i] = OQ.SETTER;
              break;
              case 'deleter':
              v[i] = OQ.DELETER;
              break;
              case 'legacycaller':
              v[i] = OQ.LEGACY_CALLER;
              break;
              case 'creator':
              v[i] = OQ.CREATOR;
              break;
              default:
              throw new Error('Unknown operation qualifier:', v[i]);
            }
          }

          return v;
        },
        Serializer: function(v) {
          if (v === ';') return parser.Serializer.create();
          return parser.Operation.isInstance(v) ?
              parser.Serializer.create({operation: v}) :
              parser.Serializer.create({pattern: v});
        },
        Stringifier: function(v) {
          if (v === ';') return parser.Stringifier.create();
          return parser.Attribute.isInstance(v) ?
              parser.Stringifier.create({attribute: v}) :
              parser.Stringifier.create({operation: v});
        },
        StaticMember: function(v) {
          return parser.Attribute.isInstance(v) ?
              parser.StaticMember.create({attribute: v}) :
              parser.StaticMember.create({operation: v});
        },
        Iterable: function(v) {
          return parser.Iterable.create({type: v[2], valueType: v[3]});
        },
        Member: function(v) {
          v[2].isInherited = v[0] !== null;
          v[2].isReadOnly = v[1] !== null;
          return v[2];
        },
        ReadOnlyAttributeRest: function(v) {
          v[1].isReadOnly = v[0] !== null;
          return v[1];
        },
        OperationRest: function(v) {
          return parser.Operation.create({
            name: v[0],
            args: v[2],
          });
        },
        SerializerRestOperation: function(v) {
          if (v[0] !== null) v[1].returnType = v[0];
          return v[1];
        },
        SerializationPattern: function(v) {
          // Special case: String "getter" is the whole map/array inner
          // pattern.
          if (v[1] === 'getter')
            v[1] = [parser.Literal.create({literal: v[1]})];

          if (v[0] === '{') {
            // Map pattern.
            return parser.SerializerPattern.create({
              type: parser.SerializerPatternType.MAP,
              parts: v[1] || [],
            });
          } else if (v[0] === '[') {
            // Array pattern.
            return parser.SerializerPattern.create({
              type: parser.SerializerPatternType.ARRAY,
              parts: v[1] || [],
            });
          } else {
            // Identifier pattern.
            return parser.SerializerPattern.create({
              type: parser.SerializerPatternType.IDENTIFIER,
              parts: [v],
            });
          }
        },
        AttributeRest: function(v) {
          return parser.Attribute.create({type: v[1], name: v[2]});
        },
        MaplikeRest: function(v) {
          return parser.MapLike.create({type: v[2], valueType: v[4]});
        },
        SetlikeRest: function(v) {
          return parser.SetLike.create({type: v});
        },
        Argument: function(v) {
          if (v[0]) v[1].attrs = v[0];
          return v[1];
        },
        OptionalArgument: function(v) {
          return parser.Argument.create(
              v[3] === null ?
                  {type: v[1], name: v[2], isOptional: true} :
              {type: v[1], name: v[2], isOptional: true, value: v[3]});
        },
        RequiredArgument: function(v) {
          return parser.Argument.create(
              v[1] === null ?
                  {type: v[0], name: v[2]} :
              {type: v[0], name: v[2], isVariadic: true});
        },
        ArrayValue: function() {
          return parser.EmptyArray.create();
        },
        ConstValueCornerCase: function() {
          // TODO(markdittmer): No checks elsewhere turn
          // Identifier("Infinity") into Infinity.
          return parser.Infinity.create({isNegative: true});
        },
        TypeWithExtendedAttributes: function(v) {
          if (v[0]) v[1].attrs = v[0];
          return v[1];
        },
        UnionType: function(v) {
          return parser.UnionType.create({types: v[1], suffixes: v[3] || []});
        },
        UnionMemberType: function(v) {
          if (v[0]) v[1].attrs = v[0];
          return v[1];
        },
        ParameterizedType: function(v) {
          // Add params to existing NonUnionType.
          if (v[0].params) v[0].params = v[0].params.concat(v[2]);
          else v[0].params = v[2];
          if (v[4] !== null) v[0].suffixes = v[4];
          return v[0];
        },
        SimpleType: function(v) {
          return v === null ? null :
              parser.NonUnionType.create(
                  v[1] === null ? {name: v[0]} : {name: v[0], suffixes: v[1]});
        },
        BuiltInTypeName: function(v) {
          return parser.Literal.create({literal: v.join(' ')});
        },
        TypeSuffixes: function(v) {
          if (v === null) return null;
          // <1> (Nullable|Array)
          // <2> left-out-optional
          // ==> [ <1> ]
          if (v[1] === null) return [v[0]];
          if (v[0] === parser.TypeSuffix.NULLABLE) {
            // <1> Nullable
            // <2> Array
            // <3> TypeSuffixes
            // ==> [ <1>, <2> ].concat(<3>)
            return [v[0], v[1][0]].concat(v[1][1]);
          } else {
            // <1> Array
            // <2> TypeSuffixes
            // ==> [ <1> ].concat(<2>)
            return [v[0]].concat(v[1]);
          }
        },
        Nullable: function(v) {
          return parser.TypeSuffix.NULLABLE;
        },
        Array: function(v) {
          return parser.TypeSuffix.ARRAY;
        },
        OptionalType: function(v) {
          return v === null ? null : v[1];
        },
        ExtendedAttributeIdentList: function(v) {
          // E.g., "foo=(a, b)"
          return parser.ExtendedAttributeIdentList.create({
            name: v[0],
            args: v[3],
          });
        },
        ExtendedAttributeNamedArgList: function(v) {
          // E.g., "a=b(T1 c, T2 d)"
          return parser.ExtendedAttributeNamedArgList.create({
            name: v[0],
            opName: v[2],
            args: v[4],
          });
        },
        ExtendedAttributeIdentifierOrString: function(v) {
          return parser.ExtendedAttributeIdentifierOrString.create({
            name: v[0],
            value: v[2],
          });
        },
        ExtendedAttributeArgList: function(v) {
          return parser.ExtendedAttributeArgList.create({
            name: v[0],
            args: v[2],
          });
        },
        ExtendedAttributeNoArgs: function(v) {
          return parser.ExtendedAttributeNoArgs.create({name: v});
        },
        integer: function(v) {
          v[1].isNegative = v[0] === '-';
          return v[1];
        },
        dec: function(v) {
          return parser.DecInteger.create({literal: v});
        },
        hex: function(v) {
          return parser.HexInteger.create({literal: v});
        },
        oct: function(v) {
          return parser.OctInteger.create({literal: v});
        },
        float: function(v) {
          return parser.Float.create({
            isNegative: v[0] === '-',
            literal: v[1],
          });
        },
        identifier: function(v) {
          return parser.Identifier.create({literal: v[0] + v[1]});
        },
        string: function(v) {
          return parser.String.create({literal: v});
        },
      });
    },

    // Reusable action for productions of the form FooMembers.
    function extAttrAndValue(Ctor, key) {
      return function(v) {
        var ret = [];
        if (v === null) return ret;
        for (var i = 0; i < v.length; i++) {
          var data = {attrs: v[i][0] || []};
          data[key] = v[i][1];
          ret.push(Ctor.create(data));
        }
        return ret;
      };
    },
  ],
});
