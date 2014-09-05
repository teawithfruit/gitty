/*
 * Gitty - index.js
 * Author: Gordon Hall
 *
 * Initializes module and exposes public methods
 */

var Repository = require('./lib/repository')
  , Command = require('./lib/command')
  , pty = require('pty.js')
  , gitty;

/**
 * Setup function for getting access to a GIT repo
 * @constructor
 * @param  {String} path
 */
gitty = function(path) {
	return new Repository(path);
};

/**
 * Handles the global GIT configuration
 * @param  {String}   key
 * @param  {String}   val
 * @param  {Function} callback
 */
function config(key, val, callback) {
	var gitConfig = new Command(__dirname, 'config', ['--global', key], '"' + val + '"');
	gitConfig.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback) {
			callback.call(this, err);
		}
	});
};

/**
 * Wrapper for the GIT clone function
 * @param  {String}   path
 * @param  {String}   url
 * @param  {Function} callback
 * @param  {Object}   creds
 */
function clone(path, url, callback, creds) {
	var pterm = pty.spawn('git', ['clone', url, path], { cwd : path })
	  , repo = this
	  , err
	  , succ;
	pterm.on('data', function(data) {
		var prompt = data.toLowerCase();
		if (prompt.indexOf('username') > -1) {
			pterm.write(creds.user + '\r');
		} else if (prompt.indexOf('password') > -1) {
			pterm.write(creds.pass + '\r');
		} else if ((prompt.indexOf('error') > -1) || (prompt.indexOf('fatal') > -1)) {
			err = prompt;
		} else {
			succ = prompt;
		}
	});
	pterm.on('exit', function() {
		callback.call(repo, err, succ);
	});
};

gitty.config = config;
gitty.clone = clone;
gitty.Repository = Repository;
gitty.Command = Command;

/**
 * Export Contructor
 * @constructor
 * @type {Object}
 */
module.exports = gitty;
