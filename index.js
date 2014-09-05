/*
 * Gitty - index.js
 * Author: Gordon Hall
 *
 * Initializes module and exposes public methods
 */

var Repository = require('./lib/repository');
var pty        = require('pty.js');

/**
 * Setup function for getting access to a GIT repo
 * @constructor
 * @param  {String} path
 */
var Gitty = function(path) {
	return new Repository(path);
};

/**
 * Handles the global GIT configuration
 * @param  {String}   key
 * @param  {String}   val
 * @param  {Function} callback
 */
Gitty.config = function(key, val, callback) {
  var cmd = new Command('/', 'config', ['--global', key], '"' + val + '"');
  var done = callback || new Function();

  cmd.exec(function(error, stdout, stderr) {
    done(error || stderr || null);
  });
};

/**
 * Wrapper for the GIT clone function
 * @param  {String}   path
 * @param  {String}   url
 * @param  {Object}   creds
 * @param  {Function} callback
 */
Gitty.clone = function(path, url) {
  var self  = this;
  var args  = Array.prototype.slice.apply(arguments);
  var creds = args[2].username ? args[2] || {};
  var done  = args.slice(-1).pop() || new Function();
  var pterm = pty.spawn('git', ['clone', url, path], { cwd : path });
  var error = null;

  pterm.on('data', function(data) {
    var prompt = data.toLowerCase();

    if (prompt.indexOf('username') > -1) {
      return pterm.write(creds.username + '\r');
    }

    if (prompt.indexOf('password') > -1) {
      return pterm.write(creds.password + '\r');
    }

    if ((prompt.indexOf('error') > -1) || (prompt.indexOf('fatal') > -1)) {
      return error = prompt;
    }
  });

  pterm.on('exit', function() {
    callback(error);
  });
};

/**
 * Export Contructor
 * @constructor
 * @type {Object}
 */
module.exports = Gitty;
