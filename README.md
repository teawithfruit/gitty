# Gitty

Gitty is a Node.js wrapper for the Git CLI. It's syntax closely resembles the
Git command line syntax to asynchronously execute common commands, and parses
the output into operable objects - depending on the call.

## Prerequisites

* Node.js 0.8.x (http://nodejs.org)
* Git 1.7.x.x (http://git-scm.com)
* GNU/Linux or Mac OSX

## Installation

```
$ npm install gitty
```

**Note**: If you encounter an error during installation on Mac OSX, make sure
you have the XCode Command Line Tools installed. Gitty depends on **pty.js**
for authenticated operations - which requires GCC compiler.

1. Go to the App store and download the latest version of Xcode for free.
2. Install Xcode (the app store actually downloads the "installer" for Xcode)
3. Start Xcode
4. Go to Preferences
5. Go to Downloads
6. Click on the "install" button after "Command Line Tools"
7. Reboot

## Usage

First, require Gitty.

```javascript
var git = require('gitty');
```

The meat of the functionality is encapsulated in instances of a `Repository`
object. This object is instantiated with the path to the repository you wish to
perform actions on.

```javascript
var myRepo = git('/path/to/repo');
// sugar for --> new git.Repository('/path/to/repo');
```

Now you can call this instance of `Repository`'s methods. For example, to
execute `git log` for `myRepo`, you would do:

```javascript
myRepo.log(function(err, log) {
	if (err) {
		return console.log('Error:', err);
	}
	console.log(log);
});
```

## Potential Use Cases

* Writing an exception logger with more insight
* Building a web based Git client
* Integrating automated deployments

## Building the Documentation



## Authenticated Repositories

One challenge that was faced while developing Gitty was performing any
authenticated operations. Since OpenSSH does not read input from `stdin` for
authentication, but rather a psuedo-terminal - Gitty uses *pty.js*
(<https://github.com/chjj/pty.js/>) to spawn a pseudo-terminal for operations
that may require authentication, such as `pull`, `push`, and `clone`.

Credentials are always passed as the last argument and are optional. Below is
an example of an authenticated `Repository.push()`.

```javascript
// do authenticated push to origin
myRepo.push('origin', 'master', function(err, succ) {
	if (err) {
		return console.log(err);
	}
	// ...
}, {
	user : 'username',
	pass : 'password'
});
```

This format is consistent for all authenticated operations. Keep this in mind
if you are extending Gitty with an operation that requires authentication, and
be sure to read the pty.js documentation.

## Extending Gitty

Almost all of the `Repository` methods are simply convenience wrappers around
instances of `Command`. This makes extending the `Repository` constructor with
custom methods easy as pie! Let's run through a quick example. Let's say we
want to add a method for creating a new branch and automatically switching to
it. What do we need to do?

1. Extend the `Repository` prototype
2. Create a new instance of `Command`
3. Parse the output and pass to a callback

Three steps is all it should take to add a new method to the `Repository`
constructor, and below is how you might do it.

```javascript
// require gitty
var git = require('gitty');

// create new prototype endpoint
// we want to pass a branch name and callback into this method
git.Repository.prototype.branchAndCheckout = function(name, callback) {

	// save the scope of the repository
	var repo = this
	// create a new instance of Command
	  , cmd = new git.Command(repo.path, 'checkout', ['-b'], name);

	// execute the command and determine the outcome
	cmd.exec(function(error, stdout, stderr) {
		var err = error || stderr;

		// call the callback function in the repository scope
		// passing it err and stdout
		callback.call(repo, err, stdout);
	});
};
```

It's a simple as that. Now you would be able to use this custom method in your
application, like so:

```javascript
myRepo.branchAndCheckout('myBranch', function(err, data) {
	if (err) {
		// throw error
	} else {
		console.log(data);
	}
});
```

## The Output Parser

The output parser is simply a collection of functions that accept the string
output of an executed command, and turn it into something that can be operated
on. For example, the output from `git log` gets converted to an array of
object-literals before being returned back to the callback for
`Repository.log()`.

## Author

Gitty was written by Gordon Hall (gordon@gordonwritescode.com)  
Licensed under LGPLv3 license
