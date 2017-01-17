var width=200;
var CONSTS={width:100};
function foo(){
var width=100;
React.createElement(View,{style:{width:width}});
}

function foz(){
var BAR={width:100};
React.createElement(View,{style:{width:BAR.width}});
}

function bar(){
React.createElement(View,{style:{width:width}});
}

function baz(){
React.createElement(View,{style:{width:CONSTS.width}});
}

function zoo(){
React.createElement(View,{style:{width:this.width()}});
}var _styles=require("react-native").StyleSheet.create({s0:{width:width},s1:{width:CONSTS.width}});