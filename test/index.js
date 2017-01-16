var fs = require('fs');
var fixtures = fs.readdirSync(__dirname + '/fixtures');
var transform = require('babel-core').transform;
var expect = require('chai').expect;

describe('transforms', function () {
  fixtures.forEach(function (dir) {
    it('should handle ' + dir, function () {
      var src = transform(fs.readFileSync(__dirname + '/fixtures/' + dir + '/actual.js'), {
        plugins: ['syntax-jsx', require('../src/index.js')]
      });
      expect(
        src.code.trim()
      ).to.equal(fs.readFileSync(__dirname + '/fixtures/' + dir + '/expected.js', 'utf8').trim())
    });
  });
});
