/*
 * Gitty - repository.js
 * Author: Gordon Hall
 * 
 * Primary repository class that exposes all repository level operations
 */

var fs = require('fs')
  , path = require('path')
  , exec = require('../modules/execute.js')
  , parse = require('../modules/output-parser.js')
  , Repository;

////
// Repository Constructor
////
Repository = function(repo) {
	// create assumed path to .git directory
	var repo_path = path.normalize(repo)
	  , split_path = repo_path.split('/');
	// determine if this is a valid repo
	this.isRepository = fs.existsSync(repo_path + '/.git');
	// set name as dir name
	this.name = split_path[split_path.length - 1];
	// set path
	this.path = repo_path;
};

////
// Repository.init([flags], callback)
// Initializes the directory as a Git repository
////
Repository.prototype.init = function(flags, callback) {
	exec(this.path, 'init', flags, '', function(error, stdout, stderr) {
		var output = stdout
		  , err = error || stderr || false;
		// if there is output, parse it
		if (output) {
			output = parse['init'](output);
		}
		callback.call(this, err, output);
	});
};

////
// Repository.log(callback)
// Passes commit history as array to callback
////
Repository.prototype.log = function(callback) {
	var prettyFormat = '--pretty=format:\'{"commit": "%H","author": "%an <%ae>","date": "%ad","message": "%s"},\'';
	exec(this.path, 'log', [prettyFormat], '', function(error, stdout, stderr) {
		var output = stdout
		  , err = error || stderr || false;
		  console.log(output);
		if (output) {
			output = parse['log'](output);
		}
		callback.call(this, err, output);
	});
};

// Export Constructor
module.exports = Repository;