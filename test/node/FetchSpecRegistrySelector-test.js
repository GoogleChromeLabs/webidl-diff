// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('FetchSpecRegistrySelector', function() {
  var FetchSpecRunner;
  var FetchSpecRegistrySelector;
  var LogBox;
  var SkeletonBox;
  var ctx;

  beforeEach(function() {
    FetchSpecRunner = foam.lookup('org.chromium.webidl.FetchSpecRunner');
    FetchSpecRegistrySelector =
        foam.lookup('org.chromium.webidl.FetchSpecRegistrySelector');
    LogBox = foam.lookup('foam.box.LogBox');
    SkeletonBox = foam.lookup('foam.box.SkeletonBox');

    ctx = foam.box.Context.create();
    ctx.registry = foam.box.SelectorRegistry.create({
      selector: FetchSpecRegistrySelector.create(null, ctx),
    }, ctx);
  });

  it('should return the default registry for other boxes', function() {
    // Expect boxes that are not FetchSpecRunner to get regular registry.
    var box = SkeletonBox.create({ data: LogBox.create() });
    var registry = ctx.registry.selector.select(null, null, box);
    expect(registry).toBe(ctx.registry.selector.defaultRegistry);
  });

  it('should return a different registry for FetchSpecRunner', function() {
    // Expect FetchSpecRunner to get a different registry.
    var box = SkeletonBox.create({ data: FetchSpecRunner.create() });
    var registry = ctx.registry.selector.select(null, null, box);
    expect(registry).toBe(ctx.registry.selector.fetchRegistry);
  });
});
