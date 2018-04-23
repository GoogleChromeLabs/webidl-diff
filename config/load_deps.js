'use strict';

var path = require('path');

// Use config/files.js to determine what order to load code in.
var rootDir = path.resolve(__dirname, '..');
require(path.resolve(rootDir, 'config', 'files.js'));
var files = global.WEB_IDL_DIFF_FILES.slice();
for (var i = 0; i < files.length; i++) {
  require(path.resolve(rootDir, files[i]));
}