// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('IDLFileContents', function() {
  var IDLFileContents;
  var PlatformBlinkIDLFileDAO;
  var blinkFilesDAO;
  var blinkFiles;
  var blinkFileContentsDAO;

  // NOTE: Tests in this file must not be FOAM context-sensitive because shared
  // test data are created once in beforeAll(), and each test will run in its
  // own test context.
  beforeAll(function() {
    IDLFileContents = foam.lookup('org.chromium.webidl.IDLFileContents');
    PlatformBlinkIDLFileDAO =
        foam.lookup('org.chromium.webidl.PlatformBlinkIDLFileDAO');
    blinkFilesDAO = PlatformBlinkIDLFileDAO.create();
    blinkFiles = blinkFilesDAO.select();
    blinkFileContentsDAO = foam.lookup('foam.dao.MDAO').create({
      of: IDLFileContents
    });
  });

  it('should load Blink web platform IDL files', function(done) {
    blinkFiles.then(function(sink) {
      var fileContentsAsLib = IDLFileContents.create();
      var loadFile = fileContentsAsLib.fromBaseFile.bind(fileContentsAsLib);

      var array = sink.a;
      var promises = new Array(array.length);
      for (var i = 0; i < array.length; i++) {
        array[i].fetch().then(loadFile);
      }
      Promise.all(promises).then(function(loadedFiles) {
        expect(array.length).toBe(loadedFiles.length);
        for (var i = 0; i < loadedFiles.length; i++) {
          expect(IDLFileContents.isInstance(loadedFiles[i])).toBe(true);
          expect(loadedFiles[i].contents).not.toBe('');
        }
        done();
      });
    });
  });
});
