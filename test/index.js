var fs = require('fs');
var fixtures = fs.readdirSync(__dirname + '/fixtures');
var transform = require('babel-core').transform;
var expect = require('chai').expect;

describe('transforms', function () {
  fixtures.forEach(function (dir) {
    if (process.env.ONLY_TEST && process.env.ONLY_TEST !== dir) {
      return;
    }

    var options = {};
    if (fs.existsSync(__dirname + '/fixtures/' + dir + '/options.json')) {
      options = require(__dirname + '/fixtures/' + dir + '/options.json');
    }

    var beforeSrc = transform(fs.readFileSync(__dirname + '/fixtures/' + dir + '/actual.js'), {
      presets: [
        {
          plugins: [require('../src/index.js')]
        },
        'react-native',
        options
      ],
    });

    it('should handle ' + dir + ' when plugin before preset', function () {
      if (process.env.RECORD_EXPECTED === 'yes') {
        fs.writeFileSync(__dirname + '/fixtures/' + dir + '/expected.js', beforeSrc.code)
        return;
      }

      expect(
        beforeSrc.code
      ).to.equal(fs.readFileSync(__dirname + '/fixtures/' + dir + '/expected.js', 'utf8'));
    });

    it('should handle ' + dir  + ' when plugin after preset', function () {
      var src = transform(fs.readFileSync(__dirname + '/fixtures/' + dir + '/actual.js'), {
        presets: [
          'react-native',
          {
            plugins: [require('../src/index.js')]
          },
          options
        ],
      });

      if (process.env.RECORD_EXPECTED === 'yes') {
        expect(beforeSrc.code).to.equal(src.code);
        return;
      }


      expect(
        src.code
      ).to.equal(fs.readFileSync(__dirname + '/fixtures/' + dir + '/expected.js', 'utf8'));
    });
  });
});
