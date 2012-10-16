/*
 * Gitty - execute.js
 * Author: Gordon Hall
 * 
 * Handles the execution of Git commands
 */

var exec = require('child_process').exec;

module.exports = function(repo_path, operation, flags, options, callback) {
	// assemble command
	var command = 'git ' + operation;
	// add flags
	for (var flag = 0; flag < flags.length; flag ++) {
		command += ' ' + flags[flag];
	}
	// add options
	command +=  ' ' + options;
	// execute command
	exec(command, { cwd : repo_path }, callback);
};
