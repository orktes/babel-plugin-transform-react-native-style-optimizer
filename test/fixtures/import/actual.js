import ReactNative, {StyleSheet} from 'react-native';
import SomeModule from 'someModule';

<View style={[{width: 100, height: SomeModule.height}, styles.foo]} />;

const styles = StyleSheet.create({
  foo: {
    height: 100
  }
});
