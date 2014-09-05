var fs     = require('fs');
var should = require('should');
var rimraf = require('rimraf');
var HOME   = process.env.HOME;
var Gitty  = require('../index');

describe('Gitty', function() {

  before(function(ready) {
    if (fs.existsSync(HOME + '/.gitty')) {
      rimraf.sync(HOME + '/.gitty');
    }

    fs.mkdirSync(HOME + '/.gitty');

    ready();
  });

  describe('.clone()', function() {
    var url = require('../package').repository.url;

    it('should clone the repository', function(done) {
      this.timeout(5000);
      Gitty.clone(HOME + '/.gitty/gitty', url, function(err) {
        should.not.exist(err);
        fs.exists(HOME + '/.gitty/gitty/package.json', function(exists) {
          exists.should.be.true;
          done();
        });
      });
    });

  });

})
