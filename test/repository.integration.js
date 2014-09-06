var fs         = require('fs');
var should     = require('should');
var rimraf     = require('rimraf');
var HOME       = process.env.HOME;
var Repository = require('../lib/repository');

describe('Repository', function() {

  var repo1 = null;
  var repo2 = null;

  before(function(ready) {
    if (fs.existsSync(HOME + '/.gitty')) {
      rimraf.sync(HOME + '/.gitty');
    }

    fs.mkdirSync(HOME + '/.gitty');
    fs.mkdirSync(HOME + '/.gitty/test1');
    fs.mkdirSync(HOME + '/.gitty/test2');

    repo1 = new Repository(HOME + '/.gitty/test1');
    repo2 = new Repository(HOME + '/.gitty/test2');

    repo2.on('ready', ready);
  });

  after(function() {
    rimraf.sync(HOME + '/.gitty/test1');
    rimraf.sync(HOME + '/.gitty/test2');
  });

  describe('.init()', function() {

    it('should initialize the new repository', function(done) {
      repo1.init(function(err) {
        should.not.exist(err);
        repo1.initialized.should.equal(true);
        done();
      });
    });

    it('should reinitialize the existing repository', function(done) {
      repo1.init(function(err) {
        should.not.exist(err);
        done();
      });
    });

  });

  describe('.initSync()', function() {

    it('should initialize the new repository', function(done) {
      repo2.initSync().should.be.true;
      done();
    });

    it('should reinitialize the existing repository', function(done) {
      repo2.initSync().should.be.true;
      done();
    });

  });

  describe('.status()', function() {

    it('should show a new file in status', function(done) {
      fs.writeFile(repo1.path + '/file.txt', 'i am a file', function(err) {
        repo1.status(function(err, status) {
          should.not.exists(err);
          (status.untracked.indexOf('file.txt') === 0).should.be.true;
          done();
        });
      });
    });

  });

  describe('.statusSync()', function() {

    it('should show a new file in status', function(done) {
      fs.writeFileSync(repo2.path + '/file.txt', 'i am a file');
      (repo2.statusSync().untracked.indexOf('file.txt') === 0).should.be.true;
      done();
    });

  });

  describe('.add()', function() {

    it('should stage a file for commit', function(done) {
      repo1.add(['file.txt'], function(err) {
        should.not.exist(err);
        repo1.status(function(err, status) {
          should.not.exists(err);
          status.staged.should.have.lengthOf(1);
          done();
        });
      });
    });

  });

  describe('.addSync()', function() {

    it('should stage a file for commit', function(done) {
      repo2.addSync(['file.txt']);
      repo2.statusSync().staged.should.have.lengthOf(1);
      done();
    });

  });

  describe('.commit()', function() {

    it('should commit the working tree', function(done) {
      repo1.commit('initial commit', function(err) {
        should.not.exist(err);
        repo1.status(function(err, status) {
          should.not.exist(err);
          status.staged.should.have.lengthOf(0);
          status.unstaged.should.have.lengthOf(0);
          status.untracked.should.have.lengthOf(0);
          done();
        });
      });
    });

  });

  describe('.commitSync()', function() {

    it('should commit the working tree', function(done) {
      repo2.commitSync('initial commit');
      var status = repo2.statusSync();
      status.staged.should.have.lengthOf(0);
      status.unstaged.should.have.lengthOf(0);
      status.untracked.should.have.lengthOf(0);
      done();
    });

  });

  describe('.log()', function() {

    it('should get the commit log', function(done) {
      repo1.log(function(err, log) {
        should.not.exist(err);
        log.should.have.lengthOf(1);
        log[0].message.should.equal('initial commit');
        done();
      });
    });

  });

  describe('.logSync()', function() {

    it('should get the commit log', function(done) {
      var log = repo2.logSync();
      log.should.have.lengthOf(1);
      log[0].message.should.equal('initial commit');
      done();
    });

  });

  describe('.unstage()', function() {

    it('should unstage a file from commit', function(done) {
      fs.writeFile(repo1.path + '/file.txt', 'modified file', function(err) {
        repo1.add(['file.txt'], function(err) {
          repo1.unstage(['file.txt'], function(err) {
            should.not.exist(err);
            repo1.status(function(err, status) {
              status.unstaged.should.have.lengthOf(1);
              done();
            });
          });
        });
      });
    });

  });

  describe('.unstageSync()', function() {

    it('should unstage a file from commit', function(done) {
      fs.writeFileSync(repo2.path + '/file.txt', 'modified file');
      repo2.addSync(['file.txt']);
      repo2.unstageSync(['file.txt']);
      repo2.statusSync().unstaged.should.have.lengthOf(1);
      done();
    });

  });

  describe('.remove()', function() {

    it('should remove an added file', function(done) {
      fs.writeFile(repo1.path + '/file1.txt', 'i am a file', function(err) {
        repo1.add(['file1.txt'], function(err) {
          repo1.remove(['file1.txt'], function(err) {
            should.not.exist(err);
            repo1.status(function(err, status) {
              status.untracked.should.have.lengthOf(1);
              done();
            });
          });
        });
      });
    });

  });

  describe('.removeSync()', function() {

    it('should remove an added file', function(done) {
      fs.writeFileSync(repo2.path + '/file1.txt', 'i am a file');
      repo2.addSync(['file1.txt']);
      repo2.removeSync(['file1.txt']);
      repo2.statusSync().untracked.should.have.lengthOf(1);
      done();
    });

  });

  describe('.createBranch()', function() {

    it('should create a new branch', function(done) {
      repo1.createBranch('test', function(err) {
        should.not.exist(err);
        repo1.getBranches(function(err, branches) {
          branches.current.should.equal('master');
          branches.others.should.have.lengthOf(1);
          done();
        });
      });
    });

  });

  describe('.createBranchSync()', function() {

    it('should create a new branch', function(done) {
      repo2.createBranchSync('test');
      repo2.getBranchesSync().current.should.equal('master');
      repo2.getBranchesSync().others.should.have.lengthOf(1);
      done();
    });

  });

  describe('.checkout()', function() {

    it('should checkout a branch', function(done) {
      repo1.checkout('test', function(err) {
        should.not.exist(err);
        repo1.getBranches(function(err, branches) {
          should.not.exist(err);
          branches.current.should.equal('test');
          done();
        });
      });
    });

  });

  describe('.checkoutSync()', function() {

    it('should checkout a branch', function(done) {
      repo2.checkoutSync('test');
      repo2.getBranchesSync().current.should.equal('test');
      done();
    });

  });

  describe('.getBranches()', function() {

    it('should list all branches', function(done) {
      repo1.getBranches(function(err, branches) {
        should.not.exist(err);
        branches.current.should.equal('test');
        branches.others.should.have.lengthOf(1);
        branches.others[0].should.equal('master');
        done();
      });
    });

  });

  describe('.getBranchesSync()', function() {

    it('should list all branches', function(done) {
      repo2.getBranchesSync().current.should.equal('test');
      repo2.getBranchesSync().others.should.have.lengthOf(1);
      repo2.getBranchesSync().others[0].should.equal('master');
      done();
    });

  });

  describe('.merge()', function() {

    it('should merge a branch into the current branch', function(done) {
      repo1.add(['file1.txt'], function(err) {
        repo1.commit('add file', function(err) {
          repo1.checkout('master', function(err) {
            repo1.merge('test', function(err) {
              should.not.exist(err);
              repo1.log(function(err, log) {
                log.should.have.lengthOf(2);
                done();
              })
            });
          });
        });
      });
    });

  });

  describe('.mergeSync()', function() {

    it('should merge a branch into the current branch', function(done) {
      repo2.addSync(['file1.txt']);
      repo2.commitSync('add file');
      repo2.checkoutSync('master');
      repo2.mergeSync('test');
      repo2.logSync().should.have.lengthOf(2);
      done();
    });

  });

  describe('.createTag()', function() {

    it('should create a new tag', function(done) {

    });

  });

  describe('.createTagSync()', function() {

    it('should create a new tag', function(done) {

    });

  });

  describe('.getTags()', function() {

    it('should list all tags', function(done) {

    });

  });

  describe('.getTagsSync()', function() {

    it('should list all tags', function(done) {

    });

  });

  describe('.addRemote()', function() {

    it('should add a new remote', function(done) {

    });

  });

  describe('.addRemoteSync()', function() {

    it('should add a new remote', function(done) {

    });

  });

  describe('.getRemotes()', function() {

    it('should list all remotes', function(done) {

    });

  });

  describe('.getRemotesSync()', function() {

    it('should list all remotes', function(done) {

    });

  });

  describe('.setRemoteUrl()', function() {

    it('should change the remote url', function(done) {

    });

  });

  describe('.setRemoteUrlSync()', function() {

    it('should change the remote url', function(done) {

    });

  });

  describe('.removeRemote()', function() {

    it('should remove the remote', function(done) {

    });

  });

  describe('.removeRemoteSync()', function() {

    it('should remove the remote', function(done) {

    });

  });

  describe('.reset()', function() {

    it('should reset history to a past commit', function(done) {

    });

  });

  describe('.resetSync()', function() {

    it('should reset history to a past commit', function(done) {

    });

  });

  describe('.describe()', function() {

    it('should get the current commit hash', function(done) {

    });

  });

  describe('.describeSync()', function() {

    it('should get the current commit hash', function(done) {

    });

  });

  describe('.cherryPick()', function() {

    it('should apply changes from another commit', function(done) {

    });

  });

  describe('.cherryPickSync()', function() {

    it('should apply changes from another commit', function(done) {

    });

  });

  describe('.push()', function() {

    it('should push to the remote', function(done) {

    });

  });

  describe('.pull()', function() {

    it('should pull from the remote', function(done) {

    });

  });

});
