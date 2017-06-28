// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'LocalGitRunner',
  extends: 'foam.box.Runnable',

  documentation: 'Runnable Box of IDL files backed by a local git repository.',

  requires: [
    'foam.dao.InternalException',
    'foam.dao.MDAO',
    'foam.dao.ArrayDAO',
    'foam.net.HTTPRequest',
    'org.chromium.webidl.URLExtractor',
  ],

  constants: {
    // Path to repository fetch script, relative to this script's location.
    scriptRelativeFetchPath: '../../../../scripts/sparse-and-shallow-git-fetch.sh',
    // Hard-coded path to trusted `git` binary.
    gitPath: '/usr/bin/git',
    // Hard-coded path to trusted `find` binary.
    findPath: '/usr/bin/find',
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
      documentation: `Shell patterns to exclude IDL files from the DAO, passed
          to the shell "find" command:
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
    },
    {
      name: 'of',
      value: 'org.chromium.webidl.IDLFileContents',
    },
    {
      class: 'Array',
      of: 'foam.String',
      name: 'urls',
    },
    {
      class: 'String',
      documentation: 'Git commit hash that DAO points to.',
      name: 'commit',
    },
    {
      class: 'Boolean',
      documentation: `Internal state: Is the DAO ready to accept operations?
        May throw a foam.dao.InternalException. To automatically catch retry
        when not ready, wrap this DAO in a StoreAndForwardDAO.`,
      name: 'isReady_',
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
      name: 'urlExtractor',
    },
  ],

  methods: [
    function run(args) {
      var config = args.config;
      if (!config) throw "Missing configuration file!";

      // Verify that required properties are present
      if (!config.repositoryURL || !config.localRepositoryPath || !config.idlFileContentsFactory)
        throw "Missing argument 'repositoryURL'";

      for (var prop in config) {
        this[prop] = config[prop];
      }

      // Initialize URL Extractor
      this.urlExtractor = this.URLExtractor.create({
        include: args.include,
        exclude: args.exclude,
      });

      // Clean repository before acquiring files
      if (args.freshRepository) {
        var execSync = require('child_process').execSync;
        execSync(`/bin/rm -rf ${this.localRepositoryPath}`);
      }
      this.ensureFetched_().then(this.onFetched);
    },
    {
      name: 'checkNotReady_',
      documentation: `Return an InternalException promise rejection iff DAO is
        not ready to accept operations yet. Otherwise, return false.`,
      code: function() {
        if (this.isReady_) return false;

        // Reject on internal exception when not ready. By default, this will be
        // retried by a StoreAndForwardDAO.
        return Promise.reject(this.InternalException.create());
      },
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
        var execStr = `"${this.FIND_PATH}" "${basePath}" -type f -path ` +
            `"*.${this.extension}"`;
        for (var i = 0; i < this.findExcludePatterns.length; i++) {
          execStr += ` -not -path "${this.findExcludePatterns[i]}"`;
        }
        this.childProcess_.exec(
            execStr,
            {cwd: this.localRepositoryPath},
            this.onPaths);
      },
    },
    {
      name: 'onPaths',
      documentation: `Handler for post-IDL file paths fetch. Read file contents
        and enqueue files for insertion into delegate.`,
      code: function(error, stdout, sterr) {
        if (error) throw error;

        var paths = stdout.split('\n');
        foam.assert(
            paths.pop() === '',
            'BlinkIDLFileDAO: Expected `find` output to end in empty line');

        var promises = [];
        var onFileReady = this.onFileReady;
        var readFile = this.fs_.readFile;
        var basePath = this.localRepositoryPath;
        for (var i = 0; i < paths.length; i++) {
          // Path relative to repository root; drop "./" from "find . [...]"
          // output.
          var path = paths[i].substr(2);
          // Bind "onFileReady" with file path and promise callbacks.
          promises.push(new Promise(function(resolve, reject) {
            readFile(`${basePath}/${paths[i]}`,
                     onFileReady.bind(this, path, resolve, reject));
          }));
        }
        // Wait for all "onFileReady" to put to delegate; then notify readiness.
        Promise.all(promises).then(this.onReady);
      },
    },
    {
      name: 'onFileReady',
      documentation: `Handler for post-IDL file read. Instantiate
        "IDLFileContents" objects consistent with file metadata and contents;
        put() them to "delegate".`,
      code: function(path, resolve, reject, error, contents) {
        if (error) {
          reject(error);
        } else {
          var file = this.idlFileContentsFactory(path, contents);
          var urls = this.urlExtractor.extract(file);

          // Add them into list of URLs (for fetching)
          this.urls = this.urls.concat(urls);

          file.specUrls = urls;
          resolve(this.output({file: file, parser: this.parser}));
        }
      },
    },
    {
      name: 'onReady',
      documentation: 'Handler for initialization complete; set "isReady_".',
      code: function() {
        this.isReady_ = true;
        var self = this;

        // Dedup urls
        var urls = this.urls.filter(function(url, index, self) {
          return self.indexOf(url) === index;
        });

        self.output({
          parser: self.parser,
          urls: urls,
        });
      },
    },
  ],
});
