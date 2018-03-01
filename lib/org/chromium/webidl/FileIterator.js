// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl',
  name: 'FileIterator',

  documentation: 'Box runnable of files in a directory.',

  constants: {
    // Hard-coded path to trusted `find` binary.
    FIND_PATH: '/usr/bin/find',
  },

  properties: [
    {
      class: 'String',
      documentation: 'Path to local directory.',
      name: 'path',
      required: true,
      preSet: function (_, nu) {
        return this.path_.resolve(nu);
      },
    },
    {
      class: 'String',
      documentation: 'Extension filter for files in the directory.',
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
      documentation: `Factory function for FileContents instances to be
          stored during initialization. The caller provides the
          directory-relative path and contents of the file; all other data are
          implementation details of the factory.`,
      name: 'fileContentsFactory',
      required: true,
    },
    {
      documentation: `Files that are fetched from the repositories will be
        forwarded to this box.`,
      name: 'outputBox',
    },
    {
      documentation: 'Any errors that are encountered will be forwarded to this box.',
      name: 'errorBox',
    },
    {
      name: 'fs_',
      factory: function () { return require('fs'); },
    },
    {
      name: 'childProcess_',
      factory: function () { return require('child_process'); },
    },
    {
      name: 'path_',
      factory: function () { return require('path'); },
    },
    {
      name: 'process_',
      factory: function () { return require('process'); },
    },
    {
      name: 'onDone',
      documentation: 'Callback function when all file have been fetched.',
    },
  ],

  methods: [
    function run() {
      // Verify that required properties are present.
      if (!this.path || !this.fileContentsFactory)
        throw new Error("FileIterator: Missing required properties!");

      // Clean repository before acquiring files.
      this.enumerate_();
    },
    function enumerate_() {
      var execStr = `"${this.FIND_PATH}" "." -type f -path ` +
        `"*.${this.extension}"`;
      for (var i = 0; i < this.findExcludePatterns.length; i++) {
        execStr += ` -not -path "${this.findExcludePatterns[i]}"`;
      }
      this.childProcess_.exec(
          execStr,
          { cwd: this.path },
          this.onPaths);
    },
  ],

  listeners: [
    {
      name: 'onPaths',
      documentation: `Handler for file paths fetch. Read file contents
        and enqueue files for insertion into delegate.`,
      code: function (error, stdout, sterr) {
        if (error) throw error;

        var paths = stdout.split('\n');
        foam.assert(paths.pop() === '',
          'FileIterator: Expected `find` output to end in empty line');

        var promises = [];
        var onFileReady = this.onFileReady;
        var readFile = this.fs_.readFile;
        var basePath = this.path;
        for (var i = 0; i < paths.length; i++) {
          // Path relative to repository root; drop "./" from "find . [...]"
          // output.
          var path = paths[i].substr(2);
          // Bind "onFileReady" with file path and promise callbacks.
          promises.push(new Promise(function (resolve, reject) {
            readFile(`${basePath}/${paths[i]}`,
              onFileReady.bind(this, path, resolve, reject));
          }));
        }
        // Wait for all "onFileReady. Then call onDone() if it is defined.
        Promise.all(promises).then(function () {
          if (this.onDone) this.onDone();
        }.bind(this));
      },
    },
    {
      name: 'onFileReady',
      documentation: `Handler for file read. Instantiate file and contents;
        put() them to "delegate".`,
      code: function (path, resolve, reject, error, contents) {
        if (error) {
          reject(error);
        } else {
          // Convert contents from Buffer to String.
          contents = contents.toString();
          var file = this.fileContentsFactory(path, contents);

          resolve(this.outputBox.send({ object: file }));
        }
      },
    },
  ],
});
