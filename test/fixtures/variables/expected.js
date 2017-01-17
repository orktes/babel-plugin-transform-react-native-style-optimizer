var width=200;
var CONSTS={width:100};
var height=100;

function fooNot(){
var width=100;
height=100;
React.createElement(View,{style:{width:width}});
}

function fozNot(){
var BAR={width:100};
React.createElement(View,{style:{width:BAR.width}});
}

function bizNot(){
React.createElement(View,{style:{width:width,height:height}});
}


function barOkay(){
React.createElement(View,{style:_styles.s2});
}

function bazOkay(){
React.createElement(View,{style:_styles.s3});
}

function zooNot(){
React.createElement(View,{style:{width:this.width()}});
}var _styles=require("react-native").StyleSheet.create({s0:{width:width},s1:{width:CONSTS.width},s2:{width:width},s3:{width:CONSTS.width}});