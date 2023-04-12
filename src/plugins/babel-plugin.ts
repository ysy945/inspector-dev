import { PluginObj } from "@babel/core";
import {
  jsxAttribute,
  jsxIdentifier,
  stringLiteral,
  isVariableDeclarator,
  isSequenceExpression,
  isIdentifier,
} from "@babel/types";

export function babelInjectPlugin(filename?: string): PluginObj {
  const componentNames: string[] = [];
  let currentFilename = "";
  return {
    name: "babel-inject-plugin",
    manipulateOptions(opts, parseOpts) {
      if (filename) return;
      currentFilename = opts.filename || "";
    },
    visitor: {
      JSXOpeningElement: {
        enter(path, state) {
          const line = path.node.loc?.start?.line; // 代码所在行
          const column = path.node.loc?.start?.column; // 代码所在列
          const index =
            componentNames.length === 0 ? 0 : componentNames.length - 1;
          // 给当前jsx节点添加props
          path.node.attributes.unshift(
            jsxAttribute(
              jsxIdentifier("inspector-line"),
              stringLiteral(line!.toString())
            ),
            jsxAttribute(
              jsxIdentifier("inspector-column"),
              stringLiteral(column!.toString())
            ),
            jsxAttribute(
              jsxIdentifier("inspector-filename"),
              stringLiteral(filename ? filename : currentFilename)
            ),
            jsxAttribute(
              jsxIdentifier("inspector-component-name"),
              stringLiteral(componentNames[index] ? componentNames[index] : "")
            )
          );
        },
      },
      FunctionDeclaration: {
        enter(path) {
          const { node } = path;
          const parentIsSequenceExpression = isSequenceExpression(
            path.parentPath.node
          );
          //const a = (0,function(){})
          if (
            parentIsSequenceExpression &&
            isVariableDeclarator(path.parentPath.parentPath?.node) &&
            isIdentifier(path.parentPath.parentPath!.node.id)
          ) {
            componentNames.push(path.parentPath.parentPath!.node.id.name);
            return;
          }
          //const a = function(){}
          if (
            isVariableDeclarator(path.parentPath.node) &&
            isIdentifier(path.parentPath.node.id)
          ) {
            componentNames.push(path.parentPath.node.id.name);
            return;
          }
          //function a()
          if (node.id) {
            componentNames.push(node.id.name);
            return;
          }
          componentNames.push("");
        },
        exit() {
          componentNames.pop();
        },
      },
      ArrowFunctionExpression: {
        enter(path) {
          if (
            isVariableDeclarator(path.parentPath.node) &&
            isIdentifier(path.parentPath.node.id)
          ) {
            componentNames.push(path.parentPath.node.id.name);
            return;
          }
          componentNames.push("");
        },
        exit() {
          componentNames.pop();
        },
      },
    },
  };
}
