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



  });

  describe('.add()', function() {

  });

  describe('.addSync()', function() {



  });

  describe('.log()', function() {



  });

  describe('.logSync()', function() {



  });

});
