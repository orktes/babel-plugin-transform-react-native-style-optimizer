var width = 200;
var CONSTS = {width: 100};
function foo() {
  var width = 100;
  <View style={{width: width}} />;
}

function foz() {
  var BAR = { width: 100 };
  <View style={{ width: BAR.width }} />;
}

function bar() {
  <View style={{width: width}} />;
}

function baz() {
  <View style={{width: CONSTS.width}} />;
}

function zoo() {
  <View style={{width: this.width()}} />;
}
