// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Diff', function() {
  var Parser;
  var DiffStatus;
  var differ;

  beforeEach(function() {
    var Diff = foam.lookup('org.chromium.webidl.Diff');
    DiffStatus = foam.lookup('org.chromium.webidl.DiffStatus');
    Parser = foam.lookup('org.chromium.webidl.Parser');
    differ = Diff.create();
  });

  var createMap = function(idl, opt_source) {
    opt_source = opt_source || 'Test';
    var map = {};
    var results = Parser.create().parseString(idl, opt_source).value;
    // Results should be greater than 0. Otherwise, parse failed.
    expect(results.length > 0).toBe(true);

    results.forEach(function(result) {
      map[result.id] = result;
    });
    return map;
  };

  it('should return no diff fragments for two empty IDL', function() {
    var firstMap = createMap(`interface Test { };`);
    var secondMap = createMap(`interface Test {};`);
    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a diff fragment if interface is defined in one and not the other', function() {
    var interfaceName = 'Test';
    var firstMap = {};
    var secondMap = createMap(`interface ${interfaceName} {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting name field to be name of interface.
    expect(chunks[0].definitionName).toBe(interfaceName);
    // Expecting status to represent missing definition.
    expect(chunks[0].status).toBe(DiffStatus.MISSING_DEFINITION);
    // Expecting property path to be empty string.
    expect(chunks[0].propPath).toBe('');
    // Expecting left to be undefined and right to be defined.
    expect(chunks[0].leftValue).toBeUndefined();
    expect(chunks[0].rightValue).toBeDefined();
  });

  it('should return a diff fragment if one has a member and one does not', function() {
    var leftSrc = 'TestSrc1';
    var rightSrc = 'TestSrc2';
    var interfaceName = 'Test';
    var firstMap = createMap(`interface ${interfaceName} { serializer; };`, leftSrc);
    var secondMap = createMap(`interface ${interfaceName} {};`, rightSrc);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting definitionName field to be name of interface.
    expect(chunks[0].definitionName).toBe(interfaceName);
    // Expecting status to represent no match.
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    // Expecting difference to be in members field of definition.
    expect(chunks[0].propPath).toBe('.definition.members');
    // Expecting left to be defined, and right undefined.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
    // Expecting left source and right source to be correctly populated.
    expect(chunks[0].leftSources).toBeDefined();
    expect(chunks[0].leftSources.length).toBe(1);
    expect(chunks[0].leftSources[0]).toBe(leftSrc);
    expect(chunks[0].rightSources).toBeDefined();
    expect(chunks[0].rightSources.length).toBe(1);
    expect(chunks[0].rightSources[0]).toBe(rightSrc);
  });

  it('should return a diff fragment if members have different values', function() {
    var firstMap = createMap(`interface Test { const boolean isPotato = true; };`);
    var secondMap = createMap(`interface Test { const boolean isPotato = false; };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in the value field of the member isPotato.
    expect(chunks[0].propPath).toBe('.definition.members[isPotato].member.value.literal');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('true');
    expect(chunks[0].rightValue).toBe('false');
  });

  it('should return a diff fragment if members have different types', function() {
    var firstMap = createMap(`interface Test { attribute boolean isPotato; };`);
    var secondMap = createMap(`interface Test { attribute unsigned long isPotato; };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in the type field of member.
    expect(chunks[0].propPath).toBe('.definition.members[isPotato].member.type.name.literal');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('boolean');
    expect(chunks[0].rightValue).toBe('unsigned long');
  });

  it('should return a diff fragment if one interface inherits and one does not', function() {
    var firstMap = createMap(`interface Test { boolean isPotato(); };`);
    var secondMap = createMap(`interface Test : Potato { boolean isPotato(); };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in inheritsFrom field of definition.
    expect(chunks[0].propPath).toBe('.definition.inheritsFrom');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    // Expecting left to be null (as populated by the parser).
    expect(chunks[0].leftValue).toBe(null);
    // Expecting right to be an object (not null).
    expect(chunks[0].rightValue).toBeDefined();
    expect(chunks[0].rightValue).not.toBe(null);
  });

  it('should return a diff fragment if interfaces inherits from different class', function() {
    var firstMap = createMap(`interface Test : Potato { };`);
    var secondMap = createMap(`interface Test : Tomato { };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in inheritsFrom field of definition.
    expect(chunks[0].propPath).toBe('.definition.inheritsFrom.literal');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('Potato');
    expect(chunks[0].rightValue).toBe('Tomato');
  });

  it('should return a diff fragment if one has extended attributes, and one does not', function() {
    var firstMap = createMap(`[Constructor()] interface Test {};`);
    var secondMap = createMap(`interface Test {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in attrs field.
    expect(chunks[0].propPath).toBe('.attrs');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    // Expecting left value to be defined, right to be undefined.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
  });

  it('should return a diff fragment if one member has attributes, and one does not', function() {
    var firstMap = createMap(`interface Test { void customVoidMethod(); };`);
    var secondMap = createMap(`interface Test { [Custom] void customVoidMethod(); };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in attrs field of definition member.
    expect(chunks[0].propPath).toBe('.definition.members[customVoidMethod].attrs');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    // Expecting left value to be defined, right to be undefined.
    expect(chunks[0].leftValue).toBeUndefined();
    expect(chunks[0].rightValue).toBeDefined();
  });

  it('should return no diff fragments for definitions with members rearranged', function() {
    var firstMap = createMap(`interface Test {
      const boolean isPotato = true;
      [Custom] void customVoidMethod();
      boolean someBooleanMethod();
    };`);
    var secondMap = createMap(`interface Test {
      boolean someBooleanMethod();
      const boolean isPotato = true;
      [Custom] void customVoidMethod();
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a diff fragment for definition rearranged if members differ', function() {
    var firstMap = createMap(`interface Test {
      const boolean isPotato = false;
      [Custom] void customVoidMethod();
      boolean someBooleanMethod();
    };`);
    var secondMap = createMap(`interface Test {
      boolean someBooleanMethod();
      const boolean isPotato = true;
      [Custom] void customVoidMethod();
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in values field of definition member.
    expect(chunks[0].propPath).toBe('.definition.members[isPotato].member.value.literal');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('false');
    expect(chunks[0].rightValue).toBe('true');
  });

  it('should return a diff fragment if a member is missing in one definition', function() {
    var firstMap = createMap(`interface Test {
      [Custom] void customVoidMethod();
      boolean someBooleanMethod();
    };`);
    var secondMap = createMap(`interface Test {
      boolean someBooleanMethod();
      const boolean isPotato = true;
      [Custom] void customVoidMethod();
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be at definition level.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    expect(chunks[0].rightValue.id).toBe('isPotato');
  });

  it('should return 2 diff fragments if each definition has member that is not in other', function() {
    var firstMap = createMap(`interface Test {
      const unsigned long rating = 0.0;
      [Custom] void customVoidMethod();
      boolean someBooleanMethod();
    };`);
    var secondMap = createMap(`interface Test {
      boolean someBooleanMethod();
      const boolean isPotato = true;
      [Custom] void customVoidMethod();
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting difference to be at definition level.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    expect(chunks[1].propPath).toBe('.definition.members');
    expect(chunks[1].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    // Verify that name of definition that is reported.
    expect(chunks[0].leftValue.id).toBe('rating');
    expect(chunks[1].rightValue.id).toBe('isPotato');
  });

  it('should not return any fragments in rearranged extended attributes', function() {
    var firstMap = createMap(`
      [
        Constructor(DOMString type, optional EventInit eventInitDict),
        Exposed=(Window,Worker)
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);
    var secondMap = createMap(`
      [
        Exposed=(Window,Worker),
        Constructor(DOMString type, optional EventInit eventInitDict)
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a fragment for difference in rearranged extended attributes', function() {
    var firstMap = createMap(`
      [
        Constructor(DOMString type, EventInit eventInitDict),
        Exposed=(Window,Worker)
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);
    var secondMap = createMap(`
      [
        Exposed=(Window,Worker),
        Constructor(DOMString type, optional EventInit eventInitDict)
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expect difference to be in extended attributes field of definition.
    expect(chunks[0].propPath).toBe('.attrs[Constructor].args[eventInitDict].isOptional');
    expect(chunks[0].leftValue).toBe(false);
    expect(chunks[0].rightValue).toBe(true);
  });

  it('should return multiple fragments for multiple differences in rearranged extended attributes', function() {
    var firstMap = createMap(`
      [
        Constructor(DOMString type, EventInit eventInitDict),
        Exposed=(Window,Worker),
        DependentLifetime,
        RuntimeEnabled=Test,
        RaisesException=Constructor
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);

    var secondMap = createMap(`
      [
        Exposed=(Windows,Worker),
        RaisesException=Exposed,
        RuntimeEnabled=Test,
        Constructor(DOMString type, optional EventInit eventInitDict)
      ]
      interface Test {
        boolean someBooleanMethod();
      };`);

    // List of differences in text:
    // 1. eventInitDict is optional in 2nd definition, but not 1st.
    // 2. DependentLifetime is not present in 2nd definition.
    // 3. RaisesException is Constructor in 1st, Test in 2nd.
    // TODO: Smarter diff, one chunk for the following two items:
    // 4. Exposed has Window in 1st definition, but not 2nd.
    // 5. Exposed has Windows in 2nd definition, but not 1st.
    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(5);
  });

  it('should return no chunks for rearranged attributes', function() {
    var firstMap = createMap(`
      interface Test {
        [SameObject, PerWorldBindings] readonly attribute NodeList childNodes;
      };`);
    var secondMap = createMap(`
      interface Test {
        [PerWorldBindings, SameObject] readonly attribute NodeList childNodes;
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should report differences in rearranged attributes', function() {
    var firstMap = createMap(`
      interface Test {
        [DoNotTestNewObject, CEReactions, MeasureAs=EventSrcElement]
        Node cloneNode(optional boolean deep = false);
      };`);
    var secondMap = createMap(`
      interface Test {
        [MeasureAs=EventComposedPath, NewObject, CEReactions, DoNotTestNewObject]
        Node cloneNode(optional boolean deep = false);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting the difference to be in the attributes field of member.
    var paths = chunks.map(function(chunk) {
      return chunk.propPath;
    });
    expect(paths.includes('.definition.members[cloneNode].attrs')).toBe(true);
    expect(paths.includes('.definition.members[cloneNode].attrs[MeasureAs].value.literal')).toBe(true);
    // FUTURE: Use smarter way of retrieving objects.
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('EventSrcElement');
    expect(chunks[0].rightValue).toBe('EventComposedPath');
    expect(chunks[1].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    expect(chunks[1].leftValue).toBeUndefined();
    expect(chunks[1].rightValue).toBeDefined();
  });

  it('should return a chunk if there is a difference in parameter type suffix', function() {
    var firstMap = createMap(`
      interface Test {
        boolean isEqualNode(Node[]? nodes);
      };`);
    var secondMap = createMap(`
      interface Test {
        boolean isEqualNode(Node[] nodes);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in type suffixes of member args.
    expect(chunks[0].propPath).toBe('.definition.members[isEqualNode].member.args[nodes].type.suffixes');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    // Expecting the left to be defined and right to be undefined.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
  });

  it('should return a chunk if a parameter is missing', function() {
    var firstMap = createMap(`
      interface Test {
        boolean isEqualNode(Node b);
      };`);
    var secondMap = createMap(`
      interface Test {
        boolean isEqualNode(Node a, Node b);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in args of members.
    expect(chunks[0].propPath).toBe('.definition.members[isEqualNode].member.args');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    // Expecting the left value to be undefined, right to be defined.
    expect(chunks[0].leftValue).toBeUndefined();
    expect(chunks[0].rightValue).toBeDefined();
  });

  it('should not return a chunk for rearranged definitions', function() {
    var firstMap = createMap(`
      interface First {
        boolean isFirst();
      };

      interface Second {
        boolean isSecond();
      };`);
    var secondMap = createMap(`
      interface Second {
        boolean isSecond();
      };

      interface First {
        boolean isFirst();
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return 2 chunks for mismatched stringifier definitions.', function() {
    // Note: Technically, stringifier DOMString () and stringifier are
    // equivalent. However, Diff will treat these two as different definitions.
    // One chunk is produced for each of the definitions.
    var firstMap = createMap(`
      interface Test {
        stringifier DOMString ();
      };`);
    var secondMap = createMap(`
      interface Test {
        stringifier;
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
  });

  it('should not return a chunk for rearranged getter and setter', function() {
    var firstMap = createMap(`
      interface Test {
        getter any getByIndex(unsigned long index);
        stringifier DOMString ();
        setter void setByIndex(unsigned long index, any value);
      };`);
    var secondMap = createMap(`
      interface Test {
        setter void setByIndex(unsigned long index, any value);
        getter any getByIndex(unsigned long index);
        stringifier DOMString ();
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a chunk if getter differs in definition', function() {
    var firstMap = createMap(`
      interface Test {
        getter boolean getByIndex(unsigned long index);
      };`);
    var secondMap = createMap(`
      interface Test {
        getter any getByIndex(unsigned long index);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in the type of the definition.
    expect(chunks[0].propPath).toBe('.definition.members[getByIndex].member.returnType.name.literal');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe('boolean');
    expect(chunks[0].rightValue).toBe('any');
  });

  it('should return a chunk if getter (or setter) is missing from one definition', function() {
    var firstMap = createMap(`
      interface Test {
        getter any getByIndex(unsigned long index);
        setter void setByIndex(unsigned long index, any value);
      };`);
    var secondMap = createMap(`
      interface Test {
        getter any getByIndex(unsigned long index);
        void setByIndex(unsigned long index, any value);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in the qualifiers
    expect(chunks[0].propPath).toBe('.definition.members[setByIndex].member.qualifiers');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
  });

  it('should return no chunks for overloaded functions rearranged', function() {
    var firstMap = createMap(`
      interface Test {
        void f();
        void f(double x);
        void g();
        void g(DOMString x);
      };`);
    var secondMap = createMap(`
      interface Test {
        void g(DOMString x);
        void f(double x);
        void f();
        void g();
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return 2 diff fragments for missing static attributes', function() {
    var firstMap = createMap(`
      interface Circle {
        static readonly attribute long triangulationCount;
        Point triangulate(Circle c1, Circle c2, Circle c3);
      };`);
    var secondMap = createMap(`
      interface Circle {
        readonly attribute long triangulationCount;
        static Point triangulate(Circle c1, Circle c2, Circle c3);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting the differences to be at member level (since static is a
    // different type of member).
    var paths = chunks.map(function(chunk) {
      return chunk.propPath;
    });
    expect(paths.includes('.definition.members[triangulate].member')).toBe(true);
    expect(paths.includes('.definition.members[triangulationCount].member')).toBe(true);
  });

  it('should return no diff fragments for iterable rearranged', function() {
    var firstMap = createMap(`
      interface Test {
        iterable<Session>;
        iterable<String, String>;
      };`);
    var secondMap = createMap(`
      interface Test {
        iterable<String, String>;
        iterable<Session>;
      }`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return 2 chunks if iterable differs in parameter', function() {
    var firstMap = createMap(`
      interface Test {
        iterable<String, Session>;
        iterable<String, String>;
      };`);
    var secondMap = createMap(`
      interface Test {
        iterable<String, String>;
        iterable<Session>;
      }`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting the difference to be at member level.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[0].propPath).toBe('.definition.members');
  });

  it('should return no diff fragments for maplike / setlike rearranged', function() {
    var firstMap = createMap(`
      interface Test {
        readonly maplike<String, Session>;
        maplike<String, boolean>;
        readonly setlike<long>;
        setlike<String>;
      };`);
    var secondMap = createMap(`
      interface Test {
        setlike<String>;
        maplike<String, boolean>;
        readonly maplike<String, Session>;
        readonly setlike<long>;
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  // Namespaces Tests Begin.
  it('should not return any diff fragment for empty namespace', function() {
    var firstMap = createMap(`namespace Test {};`);
    var secondMap = createMap(`namespace Test { };`);
    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a diff fragment for partial vs non partial namespace', function() {
    var firstMap = createMap(`partial namespace Test {};`);
    var secondMap = createMap(`namespace Test {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be at isPartial at definition level.
    expect(chunks[0].propPath).toBe('.definition.isPartial');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    // Expecting left to be defined as partial, right to be non-partial.
    expect(chunks[0].leftValue).toBe(true);
    expect(chunks[0].rightValue).toBe(false);
  });

  it('should not return any diff fragments for rearranged namespace', function() {
    var firstMap = createMap(`
      namespace VectorUtils {
        double dotProduct(Vector x, Vector y);
        Vector crossProduct(Vector x, Vector y);
      };`);
    var secondMap = createMap(`
      namespace VectorUtils {
        Vector crossProduct(Vector x, Vector y);
        double dotProduct(Vector x, Vector y);
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  // Dictionaries Tests Begin.
  it('should not return any diff fragments for empty dictionaries', function() {
    var firstMap = createMap(`dictionary Test {};`);
    var secondMap = createMap(`dictionary Test { };`);
    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a diff fragment if one inherits, one does not', function() {
    var firstMap = createMap(`dictionary Test : Base {};`);
    var secondMap = createMap(`dictionary Test {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in inheritsFrom of definition.
    expect(chunks[0].propPath).toBe('.definition.inheritsFrom');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].leftValue).not.toBe(null);
    expect(chunks[0].rightValue).toBe(null);
  });

  it('should return a diff fragment if one is partial, one is not', function() {
    var firstMap = createMap(`dictionary Test {};`);
    var secondMap = createMap(`partial dictionary Test {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in isPartial of definition.
    expect(chunks[0].propPath).toBe('.definition.isPartial');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe(false);
    expect(chunks[0].rightValue).toBe(true);
  });

  it('should not return any fragments for rearranged members', function() {
    var firstMap = createMap(`dictionary PaintOptions {
      DOMString? fillPattern = "black";
      DOMString? strokePattern = null;
      Point position;
    };`);
    var secondMap = createMap(`dictionary PaintOptions {
      DOMString? strokePattern = null;
      DOMString? fillPattern = "black";
      Point position;
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a fragment for missing member', function() {
    var firstMap = createMap(`dictionary PaintOptions {
      DOMString? fillPattern = "black";
      Point position;
    };`);
    var secondMap = createMap(`dictionary PaintOptions {
      DOMString? strokePattern = null;
      DOMString? fillPattern = "black";
      Point position;
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in members of definition.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    expect(chunks[0].leftValue).toBeUndefined();
    expect(chunks[0].rightValue).toBeDefined();
  });

  it('should return a fragment if member is declared as required in one, but not other', function() {
    var firstMap = createMap(`dictionary PaintOptions {
      DOMString? fillPattern = "black";
      required DOMString strokePattern = null;
      Point position;
    };`);
    var secondMap = createMap(`dictionary PaintOptions {
      DOMString strokePattern = null;
      DOMString? fillPattern = "black";
      Point position;
    };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting the difference to be in the isRequired field of the member.
    expect(chunks[0].propPath).toBe('.definition.members[strokePattern].member.isRequired');
    expect(chunks[0].status).toBe(DiffStatus.VALUES_DIFFER);
    expect(chunks[0].leftValue).toBe(true);
    expect(chunks[0].rightValue).toBe(false);
  });

  // Enum Tests Begin.
  it('should not return any diff fragments for empty Enum', function() {
    var firstMap = createMap(`enum FoodEnum {};`);
    var secondMap = createMap(`enum FoodEnum {};`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should not return any diff fragments for rearranged Enum', function() {
    var firstMap = createMap(`
      enum FoodEnum {
        "Bread",
        "Spaghetti",
        "Sushi",
        "Potato"
      };`);
    var secondMap = createMap(`
      enum FoodEnum {
        "Potato",
        "Spaghetti",
        "Sushi",
        "Bread"
      };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(0);
  });

  it('should return a diff fragment for each missing Enum member', function() {
    var firstMap = createMap(`enum FoodEnum { "Bread", "Spaghetti" };`);
    var secondMap = createMap(`enum FoodEnum { "Spaghetti", "Sushi" };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting difference to be in members field of definition.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[0].status).toBe(DiffStatus.NO_MATCH_ON_RIGHT);
    expect(chunks[1].propPath).toBe('.definition.members');
    expect(chunks[1].status).toBe(DiffStatus.NO_MATCH_ON_LEFT);
    // Expecting the difference to have Bread defined in left but not right.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].leftValue.literal).toBe('Bread');
    expect(chunks[0].rightValue).toBeUndefined();
    // Expecting the difference to have Sushi defined in right but not left.
    expect(chunks[1].leftValue).toBeUndefined();
    expect(chunks[1].rightValue).toBeDefined();
    expect(chunks[1].rightValue.literal).toBe('Sushi');
  });

  // Callback Function Tests Begin.
  // Typedef Tests Begin.
  // Implements Statements Tests Begin.
});
