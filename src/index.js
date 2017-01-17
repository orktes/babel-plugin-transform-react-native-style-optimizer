var _ = require('lodash');

module.exports = function (opts) {
  const t = opts.types;

  function getPropertyName(prop) {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      return prop.key.name;
    }

    return '';
  }

  function compareObjectProps(aProperty, bProperty) {
    aProperty = aProperty[0] || aProperty;
    bProperty = bProperty[0] || bProperty;

    if (t.isObjectProperty(aProperty) && t.isObjectProperty(bProperty)) {
      const aName = getPropertyName(aProperty);
      const bName = getPropertyName(bProperty);

      if (aName !== bName) {
        return false;
      }

      if (t.isLiteral(aProperty.value) && t.isLiteral(bProperty.value)) {
        return aProperty.value.value === bProperty.value.value;
      }
    }
    return false;
  }

  function isJSXAttributeOfName(attr, name) {
    return t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: name });
  }

  const traverseObjectExpression = {
    ThisExpression(path, state) {
      state.local_refs = true;
      path.stop();
    },

    CallExpression(path, state) {
      // Not exactly a local ref but something we can verify to stay the same
      state.local_refs = true;
      path.stop();
    },

    Identifier(path, state) {
      if (t.isProperty(path.parentPath.node) && path.parentKey === 'key') {
        return;
      }

      const binding = path.scope.getBinding(path.node.name);

      if (binding && binding.scope) {
        if (!t.isProgram(binding.scope.block) || !binding.constant) {
          state.local_refs = true;
          path.stop();
        }
      }
    }
  };

  const traverseStyleExpression = {
    ObjectExpression(path, state) {
      var objstate = {};
      path.traverse(traverseObjectExpression, objstate);

      if (!objstate.local_refs) {
        state.styles.push(path);
      }

      path.skip();
    }
  };

  const traverseCreateElementCalls = {
    // Find React.createElementCalls
    CallExpression(path, state) {
      const node = path.node;

      if (
          !t.isMemberExpression(node.callee) ||
          !t.isIdentifier(node.callee.object, {name: 'React'}) ||
          !t.isIdentifier(node.callee.property, {name: 'createElement'})) {
        return;
      }

      path.traverse({
        ObjectProperty(path, state) {
          if (
            t.isIdentifier(path.node.key, {name: 'style'})
          ) {
            path.traverse(traverseStyleExpression, state);
          }

          path.skip();
        }
      }, state);
    }
  };

  const traverseRequires = {
    // Handle if after react-native preset
    ImportSpecifier(path, state) {
      if (
        path.node.imported.name === 'StyleSheet' &&
        path.parentPath.node.source.value === 'react-native') {
        state.styleSheetIdentifier = path.node.local;
      }
    },

    // Handle if before react-native preset
    CallExpression(path, state) {
      const node = path.node;

      if (!t.isIdentifier(node.callee) || path.node.callee.name !== 'require') {
        return;
      }

      const firstArg = node.arguments[0];

      if (t.isStringLiteral(firstArg) && firstArg.value === 'react-native') {
        state.styleSheetIdentifier = t.memberExpression(
          path.parentPath.node.id,
          t.identifier('StyleSheet')
        );
        path.stop();
      }
    }
  }

  return {
    visitor: {
      ImportSpecifier(path, state) {
        if (
          path.node.imported.name === 'StyleSheet' &&
          path.parentPath.node.source.value === 'react-native') {
          state.hasStyleSheetImport = true;
        }
      },
      Program: {
        enter(path, state) {
          state.styles = [];
        },

        exit(path, state) {
          path.traverse(traverseCreateElementCalls, state);

          let styles = _.map(state.styles, function (path) {
            return {
              node: path.node,
              paths: [path]
            }
          });

          // De-duplicate
          styles = _.uniqWith(styles, function (fstyle, style) {
            const node = style.node;
            const fnode = fstyle.node;

            if (node.properties.length !== fnode.properties.length) {
              return;
            }

            const isEqual = _.isEqualWith(
              _.sortBy(node.properties, getPropertyName),
              _.sortBy(fnode.properties, getPropertyName),
              compareObjectProps
            );

            if (isEqual) {
              style.paths = _.concat(fstyle.paths, style.paths);
              return true;
            }
          });

          if (styles.length > 0) {
            const id = path.scope.generateUidIdentifier("styles");
            const styleObj = t.objectExpression(_.map(styles, function (style, i) {
              const identifier = t.identifier(`s${i}`);
              const node = style.node;
              const styleObjReference = t.memberExpression(
                id,
                identifier
              );
              _.each(style.paths, function (path) {
                path.replaceWith(styleObjReference);
                if (t.isArrayExpression(path.parentPath)) {
                  const arrayExpressionNode = path.parentPath.node;
                  // Ugly but it's 1:30am and I'm tired
                  // TODO make sure uniq actually maintains order
                  arrayExpressionNode.elements = _.uniq(arrayExpressionNode.elements.reverse()).reverse();
                }
              });

              return t.objectProperty(identifier, node);
            }));

            // We know style sheet was imported so lets find out the remapped name
            if (state.hasStyleSheetImport) {
              path.traverse(traverseRequires, state);
            }

            let styleSheetIdentifier = state.styleSheetIdentifier;
            if (!styleSheetIdentifier) {
              styleSheetIdentifier = t.memberExpression(
                t.callExpression(
                  t.identifier('require'),
                  [t.stringLiteral('react-native')]
                ),
                t.identifier('StyleSheet')
              );
            }

            const createExpression = t.callExpression(
              t.memberExpression(
                styleSheetIdentifier,
                t.identifier('create')
              ),
              [styleObj]
            );

            path.pushContainer('body', t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                   id,
                   createExpression
                 )
              ]
            ));
          }
        }
      },

      JSXAttribute(path, state) {
        var node = path.node;
        if (!isJSXAttributeOfName(node, 'style') || !t.isJSXExpressionContainer(node.value)) {
          path.skip();
          return;
        }

        path.traverse(traverseStyleExpression, state);
      },
    }
  };
}
