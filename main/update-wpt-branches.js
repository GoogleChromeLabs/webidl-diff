// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const path = require('path');
const child = require('child_process');
const flags = require('flags');

flags.defineString('spec', undefined, 'Single spec to update');
flags.defineBoolean('update', false, 'Whether to update the local branches.');
flags.defineBoolean('push', undefined, 'Whether to push the update commit');
flags.defineBoolean('dry_run', false, 'Whether to detect differences only');
flags.defineString('start', undefined, 'Spec to skip to');
flags.defineBoolean('verbose', false, 'Verbose diff output');
flags.defineBoolean('reset', false, 'Whether to reset the state to the current master branch state.');
flags.defineBoolean('force', false, 'Whether to force-push the changes to origin.');
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

  const reportsDir = path.resolve(__dirname, '..', '..', '..', 'tidoust', 'reffy-reports');
  const idlDir = path.resolve(__dirname, '..', '..', '..', 'tidoust', 'reffy-reports', 'whatwg', 'idl');
  console.log('Checking out reffy-report @ master...');
  child.execSync('git reset --hard HEAD', { cwd: reportsDir });
  child.execSync('git checkout master', { cwd: reportsDir });
  child.execSync('git fetch', { cwd: reportsDir });
  child.execSync('git pull', { cwd: reportsDir });

  // Ensure newlines
  console.log('Ensuring reffy-report files end with a newline...');
  child.execSync(
    'for f in *.idl; do tail -c1 $f | read -r _ || echo >> $f; done',
    {
      cwd: idlDir
    })

  async function updateIDLFile(spec) {
    const singleFile = spec ? `${spec}.idl` : '';
    const wpt = path.resolve(__dirname, '..', '..', '..', 'lukebjerring', 'web-platform-tests', 'interfaces');
    if (spec) {
      console.log(`Extracting ${spec} IDL...`);
    }
    child.execSync(
      `${singleFile ? 'cp' : 'rsync -r'} ${idlDir}/${singleFile} ./`, {
        cwd: wpt
      });
  }

  const allSpecs =
    flags.get('spec')
      ? flags.get('spec').split(',')
      : child
          .execSync('ls | grep .idl$', { cwd: idlDir })
          .toString()
          .trim()
          .split('\n')
          .map(i => i.replace(/\.idl$/, ''));

  // Update all the files
  if (flags.get('spec')) {
    for (const spec of allSpecs) {
      await updateIDLFile(spec);
    }
  } else {
    updateIDLFile();
  }

  function wptGitCmd(cmd, silent) {
    let gitCmd = `/usr/bin/git ${cmd}`;
    if (!silent) {
      console.log(gitCmd);
    }
    return child.execSync(gitCmd, { cwd: wptDir }).toString();
  }

  wptGitCmd(' add interfaces/', true);
  let diffOutput = wptGitCmd('diff --name-only master -- interfaces/', true);

  let changedSpecs = diffOutput
    .trim()
    .split('\n')
    .map(i => i.match(/^interfaces\/(.*)\.idl/))
    .filter(i => !!i)
    .map(m => m[1]);

  console.log(`\n${changedSpecs.length} specs differ from master:`);
  changedSpecs.forEach(spec => {
    console.log(spec);
    console.log(wptGitCmd(`diff --stat master -- interfaces/${spec}.idl`));
  });

  console.log('\nChecking differences with local branches...');
  changedSpecs = allSpecs
    .filter(spec => {
      try {
        return wptGitCmd(`diff --name-only idl-file-updates-${spec} -- interfaces/${spec}.idl`, true);
      } catch (e) {
        console.log(`Failed to diff ${spec}`);
      }
      return false;
    });

  console.log(`\n${changedSpecs.length} specs differ from their local branches:`);
  changedSpecs.forEach(spec => console.log(spec));

  wptGitCmd('reset --hard HEAD');

  let skipTo = flags.get('start');
  if (skipTo) {
    console.log(`Skipping to ${skipTo}...`);
  }
  for (let spec of changedSpecs) {
    if (skipTo && skipTo !== spec) {
      continue;
    }
    skipTo = null;

    if (flags.get('update')) {
      console.log(`\n\nUpdating ${spec}`);
      if (flags.get('dry_run')) {
        console.log('Dry run. Skipping.');
        continue;
      }
      wptGitCmd(`checkout idl-file-updates-${spec} || git checkout -b idl-file-updates-${spec}`);
      wptGitCmd('rev-parse @{u} > /dev/null 2>&1 && git pull && git merge -X theirs master || echo "[New branch]"');
      updateIDLFile(spec);
      wptGitCmd(`add interfaces/${spec}.idl`);
      if (wptGitCmd(`diff --name-only HEAD`)) {
        wptGitCmd(`commit -a -m "Updated ${spec} IDL file"`);
      }
    }
  }

  // Just check for local branches that differ; the next check checks against
  // remote branches.
  wptGitCmd(' checkout master');
  console.log('\nChecking which local branches differ from master...');
  changedSpecs = allSpecs.filter(spec => {
    try {
      return wptGitCmd(`diff --name-only idl-file-updates-${spec} -- interfaces/${spec}.idl`, true);
    } catch (e) {
      console.log(`Failed to diff ${spec}`);
    }
    return false;
  });
  console.log(`\n${changedSpecs.length} local branches differ from master:`);
  for (const spec of changedSpecs) {
    console.log(spec);
    wptGitCmd(`diff --stat idl-file-updates-${spec} -- interfaces/${spec}.idl`, true);
  }

  wptGitCmd(' checkout master');
  console.log('\nChecking which local branches differ from their remote...');
  changedSpecs = allSpecs.filter(spec => {
    try {
      return wptGitCmd(`diff --name-only idl-file-updates-${spec}..origin/idl-file-updates-${spec} -- interfaces/${spec}.idl`, true);
    } catch (e) {
      console.log(`Failed to diff ${spec}`);
    }
    return false;
  });
  console.log(`\n${changedSpecs.length} local branches differ from their remote:`);
  for (const spec of changedSpecs) {
    console.log(spec);
    if (flags.get('verbose')) {
      console.log(wptGitCmd(`diff origin/idl-file-updates-${spec}..idl-file-updates-${spec} -- interfaces/${spec}.idl`));
    } else {
      console.log(wptGitCmd(`diff --stat origin/idl-file-updates-${spec}..idl-file-updates-${spec} -- interfaces/${spec}.idl`, true));
    }

    if (flags.get('push')) {
      wptGitCmd(`checkout idl-file-updates-${spec}`);
      if (!wptGitCmd(`diff --name-only origin/idl-file-updates-${spec} -- interfaces/${spec}.idl`)) {
        console.log('${spec}.idl is unchanged vs origin, skipping...');
        continue;
      }
      if (flags.get('dry_run')) {
        console.log('Dry run. Skipping.');
        continue;
      }
      if (flags.get('reset')) {
        wptGitCmd(`reset master`, true);
        wptGitCmd(` add interfaces/`);
        wptGitCmd(`commit -a -m "Update the ${spec} IDL file"`);
      }
      wptGitCmd(`rev-parse @{u} > /dev/null 2>&1 && git push ${flags.get('force') ? ' -f' : ''} || git push --set-upstream origin idl-file-updates-${spec}`);
    }
  }
}
