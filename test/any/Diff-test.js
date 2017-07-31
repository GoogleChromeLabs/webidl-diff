// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('Diff', function() {
  var Parser;
  var differ;

  beforeEach(function() {
    var Diff = foam.lookup('org.chromium.webidl.Diff');
    Parser = foam.lookup('org.chromium.webidl.Parser');
    differ = Diff.create();
  });

  var createMap = function(idl, opt_source) {
    opt_source = opt_source || 'Test';
    var map = {};
    var results = Parser.create().parseString(idl, opt_source).value;

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
    // Expecting difference to be in the value field of the member isPotato
    expect(chunks[0].propPath).toBe('.definition.members[isPotato].member.value.literal');
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
    // Expecting left value to be defined, right to be undefined.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
  });

  it('should return a diff fragment if one member has attributes, and one does not', function() {
    var firstMap = createMap(`interface Test { [Custom] void customVoidMethod(); };`);
    var secondMap = createMap(`interface Test { void customVoidMethod(); };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(1);
    // Expecting difference to be in attrs field of definition member.
    expect(chunks[0].propPath).toBe('.definition.members[customVoidMethod].attrs');
    // Expecting left value to be defined, right to be undefined.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].rightValue).toBeUndefined();
  });

  // Enum Tests Begin.
  it('should return a diff fragment for each missing Enum member', function() {
    var firstMap = createMap(`enum FoodEnum { "Bread", "Spaghetti" };`);
    var secondMap = createMap(`enum FoodEnum { "Spaghetti", "Sushi" };`);

    var chunks = differ.diff(firstMap, secondMap);
    expect(chunks.length).toBe(2);
    // Expecting difference to be in members field of definition.
    expect(chunks[0].propPath).toBe('.definition.members');
    expect(chunks[1].propPath).toBe('.definition.members');
    // Expecting the difference to have Bread defined in left but not right.
    expect(chunks[0].leftValue).toBeDefined();
    expect(chunks[0].leftValue.literal).toBe('Bread');
    expect(chunks[0].rightValue).toBeUndefined();
    // Expecting the difference to have Sushi defined in right but not left.
    expect(chunks[1].leftValue).toBeUndefined();
    expect(chunks[1].rightValue).toBeDefined();
    expect(chunks[1].rightValue.literal).toBe('Sushi');
  });
});
