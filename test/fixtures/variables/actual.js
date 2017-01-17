var width = 200;
var CONSTS = {width: 100};
var height = 100;

function fooNot() {
  var width = 100;
  height = 100;
  <View style={{width: width}} />;
}

function fozNot() {
  var BAR = { width: 100 };
  <View style={{ width: BAR.width }} />; // Not okay to optimize
}

function bizNot() {
  <View style={{width: width, height: height}} />; // Not okay to optimize
}


function barOkay() {
  <View style={{width: width}} />; // Okay To optimize
}

function bazOkay() {
  <View style={{width: CONSTS.width}} />; // Okay to optimize
}

function zooNot() {
  <View style={{width: this.width()}} />; // Not okay to optimize
}
