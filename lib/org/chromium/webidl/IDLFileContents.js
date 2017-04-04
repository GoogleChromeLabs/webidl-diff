// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'IDLFileContents',
  extends: 'org.chromium.webidl.IDLFileBase',

  documentation: 'An IDL file that stores its contents.',

  requires: [
    'foam.core.Property',
    'foam.net.HTTPrequest',
    'org.chromium.webidl.IDLFileBase',
  ],

  properties: [
    {
      class: 'String',
      name: 'contents',
      required: true,
      final: true,
    },
  ],

  methods: [
    function fromBaseFile(base, contents) {
      foam.assert(this.IDLFileBase.isInstance(base),
                  'Cannot fromBaseFile() from non-base-file');
      var properties = this.IDLFileBase.getAxiomsByClass(this.Property);
      var data = {contents: contents};
      for (var i = 0; i < properties.length; i++) {
        var name = properties[i].name;
        if (base.hasOwnProperty(name)) data[name] = base.name;
      }
      return this.cls_.create(data, this);
    },
  ],
});
