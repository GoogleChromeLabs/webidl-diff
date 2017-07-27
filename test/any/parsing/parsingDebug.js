/**
 * @fileoverview Description of this file.
 */

describe('parsing debug', function() {
  var Parser;
  var Outputer;

  beforeEach(function() {
    Parser = foam.lookup('org.chromium.webidl.WebKitParser');
    Outputer = foam.lookup('org.chromium.webidl.Outputer');
  });

  it('should pass...', function() {
    var firstParse = Parser.create().parseString(`
        interface Example {
          serializer Example();
        };
`);

    var firstParseValue = firstParse.value;
    var outputer = Outputer.create();

    for (var i = 0; i < firstParseValue.length; i++) {
      var firstFragment = firstParseValue[i];
      var stringified = outputer.stringify(firstFragment);
      var secondParseValue = Parser.create().parseString(stringified).value;
      var secondFragment = secondParseValue[0];

      expect(foam.util.compare(firstFragment, secondFragment)).toBe(0);
    }
  });
});
