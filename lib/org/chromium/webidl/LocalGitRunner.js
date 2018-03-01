// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'LocalGitRunner',

  documentation: 'Box runnable of IDL files backed by a local git repository.',

  requires: [
    'org.chromium.webidl.URLCollection',
    'org.chromium.webidl.URLExtractor',
    'org.chromium.webidl.FileIterator',
  ],

  imports: [
    'getDAO?',
    'source?',
  ],

  constants: {
    // Path to repository fetch script, relative to this script's location.
    SCRIPT_RELATIVE_FETCH_PATH: '../../../../scripts/sparse-and-shallow-git-fetch.sh',
    // Hard-coded path to trusted `git` binary.
    GIT_PATH: '/usr/bin/git',
  },

  properties: [
    {
      class: 'String',
      documentation: 'Remote git repository URL.',
      name: 'repositoryURL',
      required: true,
    },
    {
      class: 'String',
      documentation: `Path within repository to clone locally; the most common
          case is that IDL files of interest only appear in a particular
          subdirectory.`,
      name: 'sparsePath',
    },
    {
      class: 'String',
      documentation: 'Path to local git repository.',
      name: 'localRepositoryPath',
      required: true,
      preSet: function(_, nu) {
        return this.path_.resolve(nu);
      },
    },
    {
      class: 'String',
      documentation: 'Extension of IDL files in repository.',
      name: 'extension',
      value: 'idl',
    },
    {
      class: 'Array',
      of: 'String',
      documentation: `Shell patterns to exclude IDL files, passed to the shell
          "find" command:
          E.g. find [...] -not -path <pattern 1> -not -path <pattern 2> [...]`,
      name: 'findExcludePatterns',
    },
    {
      class: 'Function',
      documentation: `Factory function for IDLFileContents instances to be
          stored during initialization. The caller provides the
          repository-relative path and contents of the file; all other data are
          implementation details of the factory.`,
      name: 'idlFileContentsFactory',
      required: true,
      args: [
        {
          documentation: 'Path of the file',
          name: 'path',
        },
        {
          documentation: 'Contents of the file',
          name: 'contents',
        },
        {
          documentation: 'URLs extracted from of the file',
          name: 'urls',
        }
      ]
    },
    {
      class: 'String',
      documentation: 'Git commit hash that the files points to.',
      name: 'commit',
    },
    {
      class: 'Array',
      of: 'RegExp',
      documentation: 'Array of whitelisted URL RegExp to be used by URLExtractor.',
      name: 'include',
    },
    {
      class: 'Array',
      of: 'RegExp',
      documentation: 'Array of blacklisted URL RegExp to be used by URLExtractor.',
      name: 'exclude',
    },
    {
      documentation: `Files that are fetched from the repositories will be
        forwarded to this box.`,
      name: 'fileOutputBox'
    },
    {
      documentation: 'URLs collected from all the files will be forwarded to this box.',
      name: 'urlOutputBox',
    },
    {
      documentation: 'Any errors that are encountered will be forwarded to this box.',
      name: 'errorBox',
    },
    {
      documentation: `Local copy of the repositories will be removed and
        the latest revision will be fetched if set to true. Otherwise, the
        files that are present on the drive will be used instead.`,
      name: 'freshRepo',
      value: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      documentation: `If getDAO is provided, all IDL files will be forwarded
          to the DAO that is returned. This is used for persistent storage
          of the output.`,
      name: 'outputDAO',
      factory: function() {
        var filename =
            `${this.cls_.name}${this.source ? '-' + this.source.label : ''}`;
        return this.getDAO ?
            this.getDAO('org.chromium.webidl.IDLFileContents', filename) :
            null;
      },
    },
    {
      documentation: 'Stores the instance of URLExtractor used by this runner.',
      name: 'urlExtractor_',
      factory: function() {
        return this.URLExtractor.create({
          exclude: this.exclude,
          include: this.include,
        });
      },
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
    {
      name: 'childProcess_',
      factory: function() { return require('child_process'); },
    },
    {
      name: 'path_',
      factory: function() { return require('path'); },
    },
    {
      name: 'process_',
      factory: function() { return require('process'); },
    },
    {
      name: 'onDone',
      documentation: 'Callback function when all file have been fetched.',
    },
  ],

  methods: [
    function run() {
      // Verify that required properties are present.
      if (!this.repositoryURL || !this.localRepositoryPath || !this.idlFileContentsFactory)
        throw new Error("LocalGitRunner: Missing required properties!");

      // Clean repository before acquiring files.
      if (this.freshRepo) {
        var execSync = this.childProcess_.execSync;
        execSync(`/bin/rm -rf ${this.localRepositoryPath}`);
      }
      this.ensureFetched_().then(this.onFetched);
    },
    {
      name: 'ensureFetched_',
      documentation: `Ensure that "localRespositoryPath" contains at git
        repository. If it doesn't, clone "sparsePath" from "repositoryURL"
        into it.`,
      code: function() {
        var exists = this.fs_.existsSync;
        if (exists(this.localRepositoryPath) &&
            exists(this.path_.resolve(this.localRepositoryPath, '.git'))) {
          return Promise.resolve();
        }

        // Invoke in shell:
        // <fetch-script> <local-repo-path> <remote-repo-url> <sparse-path>
        var child = this.childProcess_.execFile(
            this.path_.resolve(__dirname, this.SCRIPT_RELATIVE_FETCH_PATH),
            [this.localRepositoryPath, this.repositoryURL, this.sparsePath]);
        child.stdout.pipe(this.process_.stdout);
        child.stderr.pipe(this.process_.stderr);

        return new Promise(function(resolve, reject) {
          child.on('error', reject);
          child.on('exit', function(status, signal) {
            if (status === 0) {
              resolve();
            } else {
              reject(new Error(`Non-zero exit status from git repository fetch
                script: ${status}; signal: ${signal}`));
            }
          });
        });
      },
    },
  ],

  listeners: [
    {
      name: 'onFetched',
      documentation: `Handler for post-repository fetched. Update "commit" and
        locate IDL files.`,
      code: function() {
        this.commit = this.childProcess_.execSync(
            `"${this.GIT_PATH}" rev-parse HEAD`,
            {cwd: this.localRepositoryPath})
                .toString().trim();
        
        var basePath = '.' + (this.sparsePath ? `/${this.sparsePath}` : '');
        var fileToIDLFileFactory = (function(path, contents) {
          contents = contents.toString();
          var urls = this.urlExtractor_.extract(contents);
          return this.idlFileContentsFactory(path, contents, urls);
        }).bind(this);
        this.FileIterator.create({
          path: this.localRepositoryPath,
          extension: this.extension,
          findExcludePatterns: this.findExcludePatterns,
          fileContentsFactory: fileToIDLFileFactory,
          outputBox: this.fileOutputBox,
          errorBox: this.errorBox,
          onDone: this.onDone,
        }).run();
      },
    },
  ],
});
