// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'BlinkIDLFileDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO of Gitiles-backed web platform IDL files from Blink.',

  requires: [
    'foam.dao.InternalException',
    'foam.dao.MDAO',
    'foam.net.HTTPRequest',
    'org.chromium.webidl.GitilesIDLFile',
    'org.chromium.webidl.IDLFileContents',
  ],

  constants: {
    // Base URL for Gitiles file paths.
    gitilesBaseURL: 'https://chromium.googlesource.com/chromium/src/+',
    // Blink git repository URL.
    repositoryURL: 'https://chromium.googlesource.com/chromium/src.git',
    // Path to repository fetch script, relative to this script's location.
    scriptRelativeFetchPath: '../../../../scripts/sparse-and-shallow-git-fetch.sh',
    // Path in repository to subtree of repository that contains Blink source.
    sparsePath: 'third_party/WebKit/Source',
    // Shell-style patterns to include as `find ... -not -path "<pattern>"` to
    // find Blink web platform Web IDL files.
    findExcludePatterns: ['*/testing/*', '*/bindings/tests/*', '*/mojo/*'],
    // Hard-coded path to trusted `git` binary.
    gitPath: '/usr/bin/git',
    // Hard-coded path to trusted `find` binary.
    findPath: '/usr/bin/find',
  },

  properties: [
    {
      name: 'of',
      value: 'org.chromium.webidl.IDLFileContents',
    },
    {
      name: 'delegate',
      factory: function() {
        return this.MDAO.create({of: this.of});
      },
    },
    {
      class: 'String',
      documentation: 'Path to local git repository.',
      name: 'localRepositoryPath',
      preSet: function(_, nu) {
        return this.path_.resolve(nu);
      },
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
  ],

  methods: [
    function init() {
      this.ensureFetched_().then(this.onFetched);
    },
    function put(obj) {
      return this.checkNotReady_() || this.delegate.put(obj);
    },
    function remove(obj) {
      return this.checkNotReady_() || this.delegate.remove(obj);
    },
    function find(objOrId) {
      return this.checkNotReady_() || this.delegate.find(objOrId);
    },
    function select(sink, skip, limit, order, predicate) {
      return this.checkNotReady_() ||
          this.delegate.select(sink, skip, limit, order, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.checkNotReady_() ||
          this.delegate.removeAll(skip, limit, order, predicate);
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
        repository. If it doesn't clone "SPARSE_PATH" from "REPOSITORY_URL" into
        it.`,
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
            [this.localRepositoryPath, this.REPOSITORY_URL, this.SPARSE_PATH]);
        child.stdout.pipe(this.process_.stdout);
        child.stderr.pipe(this.process_.stderr);

        return new Promise(function(resolve, reject) {
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
            `"${this.GIT_PATH}" rev-parse HEAD`, {cwd: this.localRepositoryPath})
                .toString().trim();
        var execStr = `"${this.FIND_PATH}" "${this.localRepositoryPath}/${this.SPARSE_PATH}" -type f -path "*.idl"`;
        for (var i = 0; i < this.FIND_EXCLUDE_PATTERNS.length; i++) {
          execStr += ` -not -path "${this.FIND_EXCLUDE_PATTERNS[i]}"`;
        }
        this.childProcess_.exec(execStr, this.onPaths);
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
        // Size of prefix: "/path/to/repo/" (including trailing slash).
        var prefixLen = this.localRepositoryPath.length + 1;
        for (var i = 0; i < paths.length; i++) {
          var data = {
            repository: this.REPOSITORY_URL,
            gitilesBaseURL: this.GITILES_BASE_URL,
            revision: this.commit,
            path: paths[i].substr(prefixLen),
          };
          // Bind "onFileReady" with file metadata and promise callbacks.
          promises.push(new Promise(function(resolve, reject) {
            readFile(paths[i], onFileReady.bind(this, data, resolve, reject));
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
      code: function(data, resolve, reject, error, contents) {
        if (error) {
          reject(error);
        } else {
          resolve(this.delegate.put(this.IDLFileContents.create({
            metadata: this.GitilesIDLFile.create(data),
            contents: contents.toString(),
          })));
        }
      },
    },
    {
      name: 'onReady',
      documentation: 'Handler for initialization complete; set "isReady_".',
      code: function() { this.isReady_ = true; },
    },
  ],
});
