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
  var fromBaseFileBind;

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

    // Use empty IDLFileContents as library for access to contextualized
    // fromBaseFile().
    var idlFileContents = IDLFileContents.create();
    fromBaseFileBind = function(baseFile) {
      return idlFileContents.fromBaseFile.bind(idlFileContents, baseFile);
    };
  });

  it('should load Blink web platform IDL files', function(done) {
    blinkFiles.then(function(sink) {

      var array = sink.a;
      var promises = new Array(array.length);
      for (var i = 0; i < array.length; i++) {
        var idlFile = array[i];
        promises[i] = idlFile.fetch().then(fromBaseFileBind(idlFile));
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
