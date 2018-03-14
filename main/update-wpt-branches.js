const path = require('path');
const child = require('child_process');
const flags = require('flags');
const updateWPT = require(path.resolve(__dirname, 'update-wpt.js'));

flags.defineString('spec', undefined, 'Single spec to update');
flags.defineString('push', undefined, 'Whether to push the update commit');
flags.parse();

// Checkout the update branch
exports.main = function() {
  let wptDir = path.resolve(__dirname, '..', '..', '..', 'lukebjerring/web-platform-tests')
  let checkoutAggregateBranch = 'git checkout idl-file-updates';
  child.execSync(
    checkoutAggregateBranch,
    {
      cwd: wptDir
    })
  
  function updateIDLFile(spec) {
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
    updateWPT.main();
  }
  
  // Update all the files
  updateIDLFile(flags.get('spec'));
  
  function wptGitCmd(cmd) {
    let gitCmd = `/usr/bin/git ${cmd}`;
    console.log(gitCmd);
    return child.execSync(gitCmd, { cwd: wptDir }).toString();
  }
  
  let diffOutput = wptGitCmd('diff --name-only');
  
  let changedSpecs = diffOutput
    .trim()
    .split('\n')
    .map(i => i.match(/interfaces\/(.*)\.idl/))
    .filter(i => !!i)
    .map(m => m[1]);
  
  console.log(`${changedSpecs.length} specs changed.`);
  
  wptGitCmd('reset --hard HEAD');
  
  for (let spec of changedSpecs) {
    console.log(`\n\nUpdating ${spec}`);
    wptGitCmd(`checkout idl-file-updates-${spec}`);
    updateIDLFile(spec);
    if (!wptGitCmd(`diff --name-only`)) {
      console.log('Nothing changed, skipping...');
      continue;
    }
    wptGitCmd(`add interfaces/${spec}.idl`);
    wptGitCmd(`commit -a -m "Updated ${spec} IDL file"`);
    if (flags.get('push')) {
      wptGitCmd(`git push -f`);
    }
  }
  
  console.log('\n\nThe following specs were updated:')
  changedSpecs.forEach(s => console.log(s));
}
