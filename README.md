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

```javascript
var git = require('gitty');
```

The meat of the functionality is encapsulated in instances of a `Repository`
object. This object is instantiated with the path to the repository you wish to
perform actions on.

```javascript
var myRepo = git('/path/to/repo');
```

Now you can call this instance of `Repository`'s methods. For example, to
execute `git log` for `myRepo`, you would do:

```javascript
myRepo.log(function(err, log) {
	if (err) return console.log('Error:', err);
	// ...
});
```

## Building the Documentation

...

## Authenticated Repositories

One challenge that was faced while developing Gitty was performing any
authenticated operations. Since OpenSSH does not read input from `stdin` for
authentication, but rather a psuedo-terminal - Gitty uses *pty.js*
(<https://github.com/chjj/pty.js/>) to spawn a pseudo-terminal for operations
that may require authentication, such as `pull`, `push`, and `clone`.

Credentials are always passed as the last argument and are optional. Below is
an example of an authenticated `Repository.push()`.

```javascript
myRepo.push('origin', 'master', {
	username: 'username',
	password: 'password'
}, function(err, succ) {
	if (err) return console.log(err);
	// ...
});
```

This format is consistent for all authenticated operations. Keep this in mind
if you are extending Gitty with an operation that requires authentication, be
sure to read the pty.js documentation.

## Author

Gitty was written by Gordon Hall (gordon@gordonwritescode.com)  
Licensed under LGPLv3 license
