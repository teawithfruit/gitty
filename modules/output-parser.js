/*
 * Gitty - output-parser.js
 * Author: Gordon Hall
 * 
 * Exposes parsing functions for different console output
 */

var parsers = {};

////
// Parse Init Output
////
parsers['init'] = function(output) {
	return output;
};

parsers['log'] = function(output) {
	var log = '['
	  , commits;
	log += output.substring(0, output.length - 1);
	log += ']';
	commits = JSON.parse(log);
	return commits;
};

module.exports = parsers;
