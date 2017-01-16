var width = 200;
var CONSTS = { width: 100 };
function foo() {
  var width = 100;
  <View style={{ width: width }} />;
}

function foz() {
  var BAR = { width: 100 };
  <View style={{ width: BAR.width }} />;
}

function bar() {
  <View style={_styles.s0} />;
}

function baz() {
  <View style={_styles.s1} />;
}

function zoo() {
  <View style={{ width: this.width() }} />;
}

const _styles = require("react-native").StyleSheet.create({
  s0: { width: width },
  s1: { width: CONSTS.width }
});
