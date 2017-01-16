var _ = require('lodash');



module.exports = function (opts) {
  const t = opts.types;

  function getPropertyName(prop) {
    prop = prop[0];
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      return prop.key.name;
    }

    return '';
  }

  function isJSXAttributeOfName(attr, name) {
    return t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: name });
  }

  const traverseObjectExpression = {
    ThisExpression(path, state) {
      state.local_refs = true;
      path.stop();
    },

    Identifier(path, state) {
      if (t.isProperty(path.parentPath.node) && path.parentKey === 'key') {
        return;
      }

      const binding = path.scope.getBinding(path.node.name);

      if (binding && binding.scope) {
        if (!t.isProgram(binding.scope.block)) {
          state.local_refs = true;
          path.stop();
        }
      }
    }
  };

  const traverseExpression = {
    ObjectExpression(path, state) {
      var objstate = {};
      path.traverse(traverseObjectExpression, objstate);

      if (!objstate.local_refs) {
        state.styles.push(path);
      }

      path.skip();
    }
  };

  return {
    visitor: {
      ImportSpecifier(path, state) {
        if (
          path.node.imported.name === 'StyleSheet' &&
          path.parentPath.node.source.value === 'react-native') {
          state.styleSheetIdentifier = path.node.local;
        }
      },
      Program: {
        enter(path, state) {
          state.styles = [];
        },

        exit(path, state) {
          let styles = state.styles.map(function (path) {
            return {
              node: path.node,
              paths: [path]
            }
          });

          // De-dublicate
          styles = _.uniqWith(styles, function (fstyle, style) {
            const node = style.node;
            const fnode = fstyle.node;
            const isEqual = _.isEqualWith(
              _.sortBy(node.properties, getPropertyName),
              _.sortBy(fnode.properties, getPropertyName),
              function (aProperty, bProperty) {
                aProperty = aProperty[0];
                bProperty = bProperty[0];
                if (t.isObjectProperty(aProperty) && t.isObjectProperty(bProperty)) {
                  const aName = getPropertyName(aProperty);
                  const bName = getPropertyName(bProperty);

                  if (aName !== bName) {
                    return false;
                  }

                  if (t.isLiteral(aProperty.value) && t.isLiteral(bProperty.value)) {
                    return true;
                  }
                }
                return false;
            });

            if (isEqual) {
              style.paths = _.concat(fstyle.paths, style.paths);
              return true;
            }
          });

          let styleSheetIdentifier = state.styleSheetIdentifier;
          if (styles.length > 0) {
            // TODO dedup can be done here
            const id = path.scope.generateUidIdentifier("styles");
            const styleObj = t.objectExpression(styles.map(function (style, i) {
              const identifier = t.identifier(`s${i}`);
              const node = style.node;
              style.paths.forEach(function (path) {
                path.replaceWith(t.memberExpression(
                  id,
                  identifier
                ));
              })

              return t.objectProperty(identifier, node);
            }));

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

        path.traverse(traverseExpression, state);
      },
    }
  };
}
