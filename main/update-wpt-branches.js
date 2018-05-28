// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const path = require('path');
const child = require('child_process');
const flags = require('flags');

flags.defineString('spec', undefined, 'Single spec to update');
flags.defineString('push', undefined, 'Whether to push the update commit');
flags.defineString('dry_run', false, 'Whether to detect differences only');
flags.parse();

// Checkout the update branch
exports.main = async function() {
  let wptDir = path.resolve(__dirname, '..', '..', '..', 'lukebjerring', 'web-platform-tests')
  let checkoutAggregateBranch = 'git checkout idl-file-updates';
  child.execSync(
    checkoutAggregateBranch,
    {
      cwd: wptDir
    })

  async function updateIDLFile(spec) {
    const updateWPT = path.resolve(__dirname, 'update-wpt')
    if (spec) {
      console.log(`Extracting ${spec} IDL...`);
    }
    let args = [
      `--out=${path.resolve(wptDir, 'interfaces')}`,
      `--journal=${path.resolve(__dirname, '..', 'data/IDLFragmentExtractorRunner-WebSpec-journal.js')}`,
    ];
    if (spec) {
      args.push(`--spec=${spec}`);
    }
    flags.parse(args);
    child.execSync(
      `node bin/update-wpt ${args.join(' ')}` , {
        cwd: __dirname
      })
  }

  // Update all the files
  await updateIDLFile(flags.get('spec'));

  function wptGitCmd(cmd) {
    let gitCmd = `/usr/bin/git ${cmd}`;
    console.log(gitCmd);
    return child.execSync(gitCmd, { cwd: wptDir }).toString();
  }

  wptGitCmd(' add interfaces/');
  let diffOutput = wptGitCmd('diff --name-only HEAD');

  let changedSpecs = diffOutput
    .trim()
    .split('\n')
    .map(i => i.match(/interfaces\/(.*)\.idl/))
    .filter(i => !!i)
    .map(m => m[1]);

  console.log(`${changedSpecs.length} specs changed:`);
  changedSpecs.forEach(s => console.log(s));

  wptGitCmd('reset --hard HEAD');

  for (let spec of changedSpecs) {
    console.log(`\n\nUpdating ${spec}`);
    if (flags.get('dry_run')) {
      continue;
    }
    wptGitCmd(`checkout idl-file-updates-${spec}`);
    wptGitCmd(`pull`);
    wptGitCmd(`merge -X theirs master`);
    updateIDLFile(spec);
    if (!wptGitCmd(`diff --name-only`)) {
      console.log('Nothing changed, skipping...');
      continue;
    }
    wptGitCmd(`add interfaces/${spec}.idl`);
    wptGitCmd(`commit -a -m "Updated ${spec} IDL file"`);
    if (flags.get('push')) {
      wptGitCmd(`push`);
    }
  }
}
