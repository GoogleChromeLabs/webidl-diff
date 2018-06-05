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
flags.defineString('start', undefined, 'Spec to skip to');
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

  console.log('Ensuring reffy-report files end with a newline...')
  const reportsDir = path.resolve(__dirname, '..', '..', '..', 'tidoust', 'reffy-reports', 'whatwg', 'idl');
  // Ensure newlines
  child.execSync(
    'for f in *.idl; do tail -c1 $f | read -r _ || echo >> $f; done',
    {
      cwd: reportsDir
    })

  async function updateIDLFile(spec) {
    const singleFile = spec ? `${spec}.idl` : '';
    const wpt = path.resolve(__dirname, '..', '..', '..', 'lukebjerring', 'web-platform-tests', 'interfaces');
    if (spec) {
      console.log(`Extracting ${spec} IDL...`);
    }
    child.execSync(
      `${singleFile ? 'cp' : 'rsync -r'} ${reportsDir}/${singleFile} .`, {
        cwd: wpt
      });
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

  let skipTo = flags.get('start');
  for (let spec of changedSpecs) {
    if (skipTo && skipTo !== spec) {
      continue;
    }
    skipTo = null;

    console.log(`\n\nUpdating ${spec}`);
    if (flags.get('dry_run')) {
      continue;
    }
    wptGitCmd(`checkout idl-file-updates-${spec} || git checkout -b idl-file-updates-${spec}`);
    wptGitCmd('rev-parse @{u} > /dev/null 2>&1 && git pull && git merge -X theirs master || echo "[New branch]"');
    updateIDLFile(spec);
    wptGitCmd(`add interfaces/${spec}.idl`);
    if (wptGitCmd(`diff --name-only HEAD`)) {
      wptGitCmd(`commit -a -m "Updated ${spec} IDL file"`);
    }
    if (!wptGitCmd(`diff --name-only origin interfaces/${spec}.idl`)) {
      console.log('${spec}.idl is unchanged vs origin, skipping...');
      continue;
    }
    if (flags.get('push')) {
      wptGitCmd(`rev-parse @{u} > /dev/null 2>&1 && git push || git push --set-upstream origin idl-file-updates-${spec}`);
    }
  }
}
