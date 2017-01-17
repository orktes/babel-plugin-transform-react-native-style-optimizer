var _reactNative = require('react-native');

var _reactNative2 = _interopRequireDefault(_reactNative);

var _someModule = require('someModule');

var _someModule2 = _interopRequireDefault(_someModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

<View style={[_styles.s0, styles.foo]} />;

const styles = _reactNative.StyleSheet.create({
  foo: {
    height: 100
  }
});

const _styles = _reactNative.StyleSheet.create({
  s0: { width: 100, height: _someModule2.default.height }
});
