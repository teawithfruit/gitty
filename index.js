/*
 * Gitty - index.js
 * Author: Gordon Hall
 * 
 * Initializes module and exposes public methods
 */

function config() {
	// do git config
};

function clone(path, url, callback, creds) {
	// do git clone
};

module.exports = {
	Repository : require('./classes/repository.js'),
	Command : require('./classes/command.js'),
	clone : clone,
	config : config
};
