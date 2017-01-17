var fs = require('fs');
var fixtures = fs.readdirSync(__dirname + '/fixtures');
var transform = require('babel-core').transform;
var expect = require('chai').expect;

describe('transforms', function () {
  fixtures.forEach(function (dir) {
    it('should handle ' + dir + ' when plugin before preset', function () {
      var src = transform(fs.readFileSync(__dirname + '/fixtures/' + dir + '/actual.js'), {
        presets: [
          {
            plugins: [require('../src/index.js')]
          },
          'react-native'
        ],
      });

      if (process.env.RECORD_EXPECTED === 'yes') {
        fs.writeFileSync(__dirname + '/fixtures/' + dir + '/expected.js', src.code, 'utf8')
        return;
      }

      expect(
        src.code
      ).to.equal(fs.readFileSync(__dirname + '/fixtures/' + dir + '/expected.js', 'utf8'));
    });

    it('should handle ' + dir  + ' when plugin after preset', function () {
      var src = transform(fs.readFileSync(__dirname + '/fixtures/' + dir + '/actual.js'), {
        presets: [
          'react-native',
          {
            plugins: [require('../src/index.js')]
          }
        ],
      });

      if (process.env.RECORD_EXPECTED === 'yes') {
        fs.writeFileSync(__dirname + '/fixtures/' + dir + '/expected.js', src.code, 'utf8')
        return;
      }

      expect(
        src.code
      ).to.equal(fs.readFileSync(__dirname + '/fixtures/' + dir + '/expected.js', 'utf8'));
    });
  });
});
