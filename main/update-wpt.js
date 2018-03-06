
// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// Script hacked together to load raw data for exploration in a REPL.

require('foam2');
const path = require('path');
const fs = require('fs');
const URL = require('url').URL
const flags = require('flags');

require(path.resolve(__dirname, '..', 'data/raw.js'));
require(path.resolve(__dirname, 'specs.js'));

flags.defineString('journal', './data/IDLFragmentExtractorRunner-WebSpec-journal.js', 'File containing the webidl-diff journal output.');
flags.defineString('out', undefined, 'IDL file output directory');
flags.parse();

const OUT_DIR = flags.get('out');
const JOURNAL_FILE = flags.get('journal');

// Use config/files.js to determine what order to load code in.
var rootDir = path.resolve(__dirname, '..');
require(path.resolve(rootDir, 'config', 'files.js'));
var files = global.WEB_IDL_DIFF_FILES.slice();
for (var i = 0; i < files.length; i++) {
  require(path.resolve(rootDir, files[i]));
}

function normalizedURL(href) {
  let result = new URL(href);
  // Normalize trailing slash.
  if (!/\.[a-zA-Z]+$/.test(result.pathname)
    && !result.pathname.endsWith('/')) {
    result.pathname = result.pathname + '/';
  }
  return result;
}

function sameSpec(spec, href) {
  let n = normalizedURL(href).href;
  return normalizedURL(spec.href).href == n
    || spec.alt && spec.alt.find(url => normalizedURL(url).href == n);
}

async function main() {
  if (!fs.existsSync(JOURNAL_FILE)) {
    throw new Error(`journal file ${JOURNAL_FILE} not found`);
  }
  const journal = foam.dao.JDAO.create({
    of: foam.core.FObject,
    delegate: foam.dao.ArrayDAO.create(),
    journal: foam.dao.NodeFileJournal.create({
      fd: require('fs').openSync(JOURNAL_FILE, 'r'),
    }),
  });
  let extractedSpecs = (await journal.select()).array;

  let extractedSpecsByURL = new Map();
  extractedSpecs.forEach(i => { extractedSpecsByURL.set(normalizedURL(i.url).href, []) });
  extractedSpecs.forEach(i => { extractedSpecsByURL.get(normalizedURL(i.url).href).push(i.contents) });

  let missing = []
  extractedSpecsByURL.forEach((snippets, specURL) => {
    console.log(`IDC Spec ${specURL} : ${snippets.length} snippets`);

    let spec = specs.find(i => sameSpec(i, specURL));
    if (!spec) {
      console.log("WARN: failed to find spec");
      missing.push(`${specURL}`);
      return;
    }

    let id = spec.id;

    let concat = snippets.join('\n\n')
      .replace(/ +(\n|$)/g, '\n') // Drop trailing whitespace (per line)
      .replace(/\n\n+/g, '\n\n') // More that 2 newlines => 2 newlines
      .replace(/\n*$/, '\n');  // Finish with exactly one newline


    let outdir = OUT_DIR ||
      path.resolve(__dirname, '..', '..', 'web-platform-tests/interfaces');
    if (!fs.existsSync(outdir)) {
      throw new Error(`out directory ${outdir} does not exist.`);
    }

    let filePath = path.resolve(outdir, `${id}.idl`);

    if (missing.length) {
      console.log(`Writing ${filePath}`);
      fs.writeFileSync(filePath, concat);
    }
  })

  console.log(`\n\nThe following ${missing.length} specs were not resolved:`)
  missing.forEach(i => console.log(i));
}

main();
