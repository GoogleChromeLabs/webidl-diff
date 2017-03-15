// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'ExtendedAttribute',

  methods: [
    function compareTo(other) {
      if (!this.cls_.isInstance(other)) return this.SUPER(other);

      var left = this.name ? this.name.literal : '';
      var right = other.name ? other.name.literal : '';
      if (left < right) return -1;
      else if (left > right) return 1;

      return this.SUPER(other);
    },
  ],
});
