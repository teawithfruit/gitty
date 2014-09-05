/*
 * Gitty - repository.js
 * Author: Gordon Hall
 *
 * Primary repository class that exposes all repository level operations
 */

var fs      = require('fs');
var path    = require('path');
var util    = require('util');
var pty     = require('pty.js');
var Command = require('./command');
var parser  = require('./parser');s
var logFmt  = '--pretty=format:\'{"commit":"%H","author":"%an <%ae>","date":"%ad","message":"%s"},\''

/**
 * Constructor function for all repository commands
 * @constructor
 * @param {String} repo
 */
var Repository = function(repo) {
  EventEmiter.call(this);

  self.path   = path.normalize(repo);
  self._ready = false;
  self.name   = path.basename(self.path);

  fs.exists(self.path + '/.git', function(exists) {
    self.initiliazed = exists;

    self.emit('ready');
  });
};

util.inherits(Repository, EventEmitter);

/**
 * Initializes the given directory as a GIT repository
 * @param  {Array}    flags
 * @param  {Function} callback
 */
Repository.prototype.init = function() {
  var self  = this;
  var args  = Array.prototype.slice.apply(arguments);
  var flags = Array.isArray(args[0]) ? args[0] : [];
  var done  = args.slice(-1).pop() || new Function();
  var cmd   = new Command(self.path, 'init', flags, '')

  cmd.exec(function(err, stdout, stderr) {
    if (err || stderr) {
      return done(err || new Error(stderr));
    }

    self.initialized = true;

    done();
  });
};

/**
 * Forwards the commit history to the callback function
 * @param  {String}   branch
 * @param  {Function} callback
 */
Repository.prototype.log = function() {
  var self   = this;
  var args   = Array.prototype.slice.apply(arguments);
  var branch = typeof args[0] === 'string' ? args[0] : null;
  var done   = args.slice(-1).pop() || new Function();
  var cmd    = new Command(self.path, 'log', [logFmt]);

  cmd.exec(function(error, stdout, stderr) {
    if (error || stderr) {
      return done(err || new Error(stderr));
    }

    done(null, parser.log(stdout));
  });
};

/**
 * Returns the commit history
 * @param  {String} branch
 */
Repository.prototype.logSync = function(branch) {
  var self = this;
  var cmd  = new Command(self.path, 'log', [branch || '', logFmt]);

  return parse.log(cmd.execSync());
};

/**
 * Forwards the GIT status object to the callback function
 * @param {Function} callback
 */
Repository.prototype.status = function(callback) {
	var gitStatus = new Command(this.path, 'status', [], '')
	  , gitLsFiles = new Command(this.path, 'ls-files', ['--other','--exclude-standard'], '')
	  , repo = this;
	gitStatus.exec(function(error, stdout, stderr) {
		var status = stdout
		  , err = error || stderr;
		gitLsFiles.exec(function(error, stdout, stderr) {
			var untracked = stdout;
			if (!err) {
				err = error || stderr;
			}
			status = parse['status'](status, untracked);
			if (callback && typeof callback === 'function') callback.call(repo, err, status);
		});
	});
};

/**
 * Stages the passed array of files for commiting
 * @param {Array}   files
 * @param {Function} callback
 * @param {Boolean}   useSync
 */
Repository.prototype.add = function(files, callback, useSync) {
	var options = files.join(' ')
	  , gitAdd = new Command(this.path, 'add', [], options)
	  , repo = this;
	gitAdd.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	}, useSync);
};

/**
 * Removes the passed array of files from the repo for commiting
 * @param  {Array}   files
 * @param  {Function} callback
 */
Repository.prototype.remove = function(files, callback) {
	var options = files.join(' ')
	  , gitRm = new Command(this.path, 'rm', ['--cached'], options)
	  , repo = this;
	gitRm.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Unstages the passed array of files from the staging area
 * @param  {Array}   files
 * @param  {Function} callback
 */
Repository.prototype.unstage = function(files, callback) {
	var options = files.join(' ')
	  , gitUnstage = new Command(this.path, 'reset HEAD', [], options)
	  , repo = this;
	gitUnstage.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Commits the staged area with the given message
 * @param  {String}   message
 * @param  {Function} callback
 * @param  {Boolean}   useSync
 */
Repository.prototype.commit = function(message, callback, useSync) {
	var options = '"' + message + '"'
	  , gitCommit = new Command(this.path, 'commit', ['-m'], options)
	  , repo = this;
	gitCommit.exec(function(error, stdout, stderr) {
		var err = error || stderr
		  , data = (stdout) ? parse['commit'](stdout) : null;
		if (data && data.error) {
			err = data.error;
			data = null;
		}
		if (callback && typeof callback === 'function') callback.call(repo, err, data);
	}, useSync);
};

/**
 * Forwards a denoted object with the current branch and all other available branches to the callback function
 * @param  {Function} callback
 * @param {array} parameter parameter to add to the function
 */
Repository.prototype.branches = function(callback, parameter) {
	parameter = typeof parameter != 'undefined' ? parameter : [];
	var gitBranches = new Command(this.path, 'branch', parameter, '')
	  , repo = this;
	gitBranches.exec(function(error, stdout, stderr) {
		var err = error || stderr
		  , branches = parse['branch'](stdout);
		if (callback && typeof callback === 'function') callback.call(this, err, branches);
	});
};

/**
 * Creates a new branch with the given branch name
 * @param  {String}   name
 * @param  {Function} callback
 */
Repository.prototype.branch = function(name, callback) {
	var gitBranch = new Command(this.path, 'branch', [], name)
	  , repo = this;
	gitBranch.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Performs a GIT checkout on the given branch
 * @param  {String}   branch
 * @param  {Function} callback
 */
Repository.prototype.checkout = function(branch, callback) {
	var gitCheckout = new Command(this.path, 'checkout', [], branch)
	  , repo = this;
	gitCheckout.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		repo.branches(function(err, branches) {
			var branchesErr = err;
			if (callback && typeof callback === 'function') callback.call(repo, err || branchesErr, branches);
		});
	});
};

/**
 * Performs a GIT merge in the current branch against the specified one
 * @param  {String}   branch
 * @param  {Function} callback
 */
Repository.prototype.merge = function(branch, callback) {
	var gitMerge = new Command(this.path, 'merge', [], branch)
	  , repo = this;
	gitMerge.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Forwards a array of repositorys'tags to the callback function
 * @param  {Function} callback
 */
Repository.prototype.tags = function(callback) {
	var gitTags = new Command(this.path, 'tag', [], '')
	  , repo = this;
	gitTags.exec(function(error, stdout, stderr) {
		var err = error || stderr
		  , tags = parse['tag'](stdout);
		if (callback && typeof callback === 'function') callback.call(this, err, tags);
	});
};

/**
 * Creates a new tag from the given tag name
 * @param  {String}   name
 * @param  {Function} callback
 */
Repository.prototype.tag = function(name, callback) {
	var gitTag = new Command(this.path, 'tag', [], name)
	  , repo = this;
	gitTag.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Constructor for handling GIT remotes
 * @constructor
 * @type {Object}
 */
Repository.prototype.remote = {};

/**
 * Adds a new remote
 * @param {String}   remote
 * @param {String}   url
 * @param {Function} callback
 */
Repository.prototype.remote.add = function(remote, url, callback) {
	var options = remote + ' ' + url
	  , gitRemoteAdd = new Command(this.path, 'remote add', [], options)
	  , repo = this;
	gitRemoteAdd.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Changes the URL of a existring remote
 * @param {String}   remote
 * @param {String}   url
 * @param {Function} callback
 */
Repository.prototype.remote.setUrl = function(remote, url, callback) {
	var options = remote + ' ' + url
	  , gitRemoteSetUrl = new Command(this.path, 'remote set-url', [], options)
	  , repo = this;
	gitRemoteSetUrl.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Removes the given remote
 * @param  {String}   remote
 * @param  {Function} callback
 */
Repository.prototype.remote.remove = function(remote, callback) {
	var gitRemoteRemove = new Command(this.path, 'remote rm', [], remote)
	  , repo = this;
	gitRemoteRemove.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Forwards an key-value list (remote : url) to the callback function
 * @param  {Function} callback
 */
Repository.prototype.remote.list = function(callback) {
	var gitRemoteList = new Command(this.path, 'remote', ['-v'], '')
	  , repo = this;
	gitRemoteList.exec(function(error, stdout, stderr) {
		var err = error || stderr
		  , output = stdout;
		if (output) {
			output = parse['remotes'](output);
		}
		if (callback && typeof callback === 'function') callback.call(repo, err, output);
	});
};

/**
 * Performs a GIT push to the given remote for the given branch name
 * @param  {String}   remote
 * @param  {String}   branch
 * @param  {Array}   flags
 * @param  {Function} callback
 * @param  {Object}   creds
 */
Repository.prototype.push = function(remote, branch, flags, callback, creds) {
	sync(this.path, 'push', remote, branch, flags, callback, creds);
};

/**
 * Performs a GIT pull from the given remote with the given branch name
 * @param  {String}   remote
 * @param  {String}   branch
 * @param  {Array}   flags
 * @param  {Function} callback
 * @param  {Object}   creds
 */
Repository.prototype.pull = function(remote, branch, flags, callback, creds) {
	sync(this.path, 'pull', remote, branch, flags, callback, creds);
};

/**
 * Internal function to create a fake "terminal" to circumvent the SSH limitations regarding creds
 * @uses pty
 * @param  {String}   path
 * @param  {String}   operation
 * @param  {String}   remote
 * @param  {String}   branch
 * @param  {Array}   flags
 * @param  {Function} callback
 * @param  {Object}   creds
 */
function sync(path, operation, remote, branch, flags, callback, creds) {
	var operations = [operation, remote, branch].concat(flags || [])
	  , pterm = pty.spawn('git', operations, { cwd : path })
	  , repo = this
	  , err
	  , succ;
	pterm.on('data', function(data) {
		console.log(data);
		var prompt = data.toLowerCase();
		if (prompt.indexOf('username') > -1) {
			pterm.write(creds.user + '\r');
		} else if (prompt.indexOf('password') > -1) {
			pterm.write(creds.pass + '\r');
		} else if ((prompt.indexOf('error') > -1) || (prompt.indexOf('fatal') > -1)) {
			err = parse['syncErr'](prompt);
		} else {
			succ = parse['syncSuccess'](prompt);
		}
	});
	pterm.on('exit', function() {
		if (callback && typeof callback === 'function') callback.call(repo, err, succ);
	});
};

/**
 * Resets the repository's HEAD to the specified commit and passes the commit log to the callback function
 * @param  {String}   hash
 * @param  {Function} callback
 */
Repository.prototype.reset = function(hash, callback) {
	var gitReset = new Command(this.path, 'reset', ['-q'], hash)
	  , repo = this
	  , err;
	gitReset.exec(function(error, stdout, stderr) {
		err = error || stderr || err;
		repo.log(function(logErr, log) {
			err = logErr || err;
			if (callback && typeof callback === 'function') callback.call(repo, err, log);
		});
	});
};

/**
 * Passes a 2-dimensional array to the callback containing data that can be consumed by a UI for generating a network graph
 * @param  {Function} callback
 */
Repository.prototype.graph = function(callback) {
  var gitGraph = new Command(this.path, 'log', ['--graph', '--pretty=oneline', '--abbrev-commit'], '')
    , repo = this
    , err
    , graph;
  gitGraph.exec(function(error, stdout, stderr) {
    err = error || stderr || err;
    if (!err && stdout) {
      graph = require('../modules/grapher.js')(stdout);
    }
    if (callback && typeof callback === 'function') callback.call(repo, err, graph);
  });
};

/**
 * Forwards the current commit hash to the callback function
 * @param  {Function} callback
 */
Repository.prototype.describe = function(callback) {
  var gitDescribe = new Command(this.path, 'describe', ['--tags', '--always', '--long'], '')
    , repo = this
    , err
    , graph;
  gitDescribe.exec(function(error, stdout, stderr) {
    err = error || stderr || err;
    if (callback && typeof callback === 'function') callback.call(repo, err, stdout);
  });
};

/**
 * Repository.cherryPick(commit, callback, flags)
 * Allows cherry-picking
 * @param  {string}   commit   Commit string
 * @param  {Function} callback callback-function
 * @param  {array}   flags    flags if needed
 */
Repository.prototype.cherryPick = function(commit, callback, flags) {
	var gitClean = new Command(this.path, 'cherry-pick ' + commit, [], '')
	  , repo = this;
	gitClean.exec(function(error, stdout, stderr) {
		var err = error || stderr;
		repo.isRepository = fs.existsSync(repo.path + '/.git');
		if (callback && typeof callback === 'function') callback.call(repo, err);
	});
};

/**
 * Export Constructor
 * @type {Object}
 */
module.exports = Repository;
