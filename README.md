# babel-plugin-transform-react-native-style-optimizer
> Optimize inline style attributes in react-native. Removes duplicate style definitions and moves styles to a StyleSheet.

[![Build Status](https://travis-ci.org/orktes/babel-plugin-transform-react-native-style-optimizer.svg?branch=master)](https://travis-ci.org/orktes/babel-plugin-transform-react-native-style-optimizer)

## Example

**In**

```js
<View style={[{ width: 100, height: 100 }]} />;
<View style={[
    { width: 100, height: 200 },
    { height: 100, width: 100 },
    { width: 100, height: 200 },
    { width: 100, height: 100 }
  ]}
/>;
```

**Out**

```js
<View style={[_styles.s0]} />;
<View style={[_styles.s1, _styles.s0]} />;

const _styles = require("react-native").StyleSheet.create({
  s0: { width: 100, height: 100 },
  s1: { width: 100, height: 200 }
});
```
## Installation

```sh
npm install --save-dev babel-plugin-transform-react-native-style-optimizer
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-react-native-style-optimizer"]
}
```

### Via CLI

```sh
babel --plugins transform-react-native-style-optimizer script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-react-native-style-optimizer"]
});
```

## References

* https://facebook.github.io/react-native/docs/stylesheet.html
