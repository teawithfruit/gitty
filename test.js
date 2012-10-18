/*
 * Gitty - test.js
 * Author: Gordon Hall
 * 
 * Test script and example of usage
 */

var Repository = require('./index.js').Repository
  , Gitty = new Repository(__dirname);
  
Gitty.log(function(err, log) {
	if (err) {
		console.log(err);
	} else {
		var text = '\n' + this.name + 
		           ' was last commited on ' + log[0].date + 
		           ' by ' + log[0].author + 
		           ' with the message: \n"' + log[0].message;
		console.log(text);
	}
});