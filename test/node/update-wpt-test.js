'use strict';

const path = require('path')
const updateWPT = require(path.resolve(__dirname, '..', '..', 'main', 'update-wpt.js'));

describe('trimCommonLeadingSpaces', function () {
  it(`shouldn't trim trailing spaces`, function () {
    var idl =
`  interface MyInterface {  
    boolean testPasses();  
  }  `;

    let trimmed = updateWPT.trimCommonLeadingSpaces(idl);
    let lines = trimmed.split('\n');
    lines.forEach(l => expect(l).toMatch(/  $/));
  });

  it(`shouldn't strip single spaces from content`, function () {
    var idl =
` interface MyInterface {
   boolean testPasses();
 }`;

    let trimmed = updateWPT.trimCommonLeadingSpaces(idl);
    expect(trimmed).toContain('boolean testPasses');
  });

  it(`should remove leading spaces`, function () {
    var idl = `
    interface MyInterface {
      boolean testPasses();
    }`;
    var expected = `
interface MyInterface {
  boolean testPasses();
}`;

    let trimmed = updateWPT.trimCommonLeadingSpaces(idl);
    expect(trimmed).toEqual(expected);
  });
});
