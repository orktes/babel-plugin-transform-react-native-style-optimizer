# babel-plugin-transform-react-native-style-optimizer
> Optimize inline style attributes in react-native. Removes duplicate style definitions and moves styles to a StyleSheet.

## Example

**In**

```js
<View style={[{width: 100, height: 100}]} />;
<View style={[{height: 100, width: 100}, {width: 100, height: 100}]} />;
```

**Out**

```js
<View style={[_styles.s0]} />;
<View style={[_styles.s0]} />;

const _styles = require("react-native").StyleSheet.create({
  s0: { width: 100, height: 100 }
});
```
