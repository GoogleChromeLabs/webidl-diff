// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

(function() {
  var classpaths = [
    'node_modules/foam2/src',
    'lib',
  ];
  var oldContext;

  beforeEach(function() {
    var WebModelFileDAO = foam.lookup('foam.classloader.WebModelFileDAO', true);
    var NodeModelFileDAO = foam.lookup('foam.classloader.NodeModelFileDAO', true);
    var OrDAO = foam.lookup('foam.classloader.OrDAO');
    var daoName = foam.String.daoize(foam.core.Model.name);
    var daoFactory = typeof process === 'undefined' ?
        (function() {
          var prefix = window.location.protocol + '//' +
              window.location.host;
          if (window.location.port) prefix += ':' + window.location.port;
          prefix += '/';

          return function browserDAOFactory(classpath) {
            return WebModelFileDAO.create({url: prefix + classpath});
          };
        })() :
        function nodeDAOFactory(classpath) {
          return NodeModelFileDAO.create({
            classpath: `${__dirname}/../../${classpath}`
          });
        };

    var modelDAO = daoFactory(classpaths[0]);
    for (var i = 1, classpath; classpath = classpaths[i]; i++) {
      modelDAO = OrDAO.create({
        primary: modelDAO,
        delegate: daoFactory(classpath),
      });
    }

    oldContext = foam.__context__;
    var subContextData = {};
    subContextData[daoName] = modelDAO;
    foam.__context__ = foam.createSubContext(subContextData);
  });

  afterEach(function() {
    foam.__context__ = oldContext;
  });
})();
