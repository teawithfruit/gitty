/*
 * Gitty - command.js
 * Author: Gordon Hall
 *
 * Handles the execution of Git commands
 */

var exec = require('child_process').exec
  , execSync = require('execSync').stdout
  , Command;

/**
 * Setup function for running GIT commands on the command line
 * @constructor
 * @param {String} repo_path
 * @param {String} operation
 * @param {Array}  flags
 * @param {String} options
 */
Command = function(path, operation, flags, options) {
  flags   = flags   || [];
  options = options || [];

  this.repo    = path;
  this.command = 'git ' + operation + ' ' + flags.join(' ') + ' ' + options;
};

/**
 * Executes the stored operation in the given path
 * @param  {Function} callback
 */
Command.prototype.exec = function(callback) {
  exec(this.command, { cwd: this.repo }, callback);
};

/**
 * Executes the stored operation in the given path syncronously
 */
Command.prototype.execSync = function() {
  process.chdir(this.repo);
  return execSync.exec(this.command).stdout;
};

/**
 * Export Contructor
 * @constructor
 * @type {Object}
 */
module.exports = Command;
