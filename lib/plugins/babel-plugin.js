"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.babelInjectPlugin = void 0;
const types_1 = require("@babel/types");
function babelInjectPlugin(filename) {
    const componentNames = [];
    let currentFilename = "";
    return {
        name: "babel-inject-plugin",
        manipulateOptions(opts, parseOpts) {
            if (filename)
                return;
            currentFilename = opts.filename || "";
        },
        visitor: {
            JSXOpeningElement: {
                enter(path, state) {
                    var _a, _b, _c, _d;
                    const line = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line; // 代码所在行
                    const column = (_d = (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.start) === null || _d === void 0 ? void 0 : _d.column; // 代码所在列
                    const index = componentNames.length === 0 ? 0 : componentNames.length - 1;
                    // 给当前jsx节点添加props
                    path.node.attributes.unshift((0, types_1.jsxAttribute)((0, types_1.jsxIdentifier)("inspector-line"), (0, types_1.stringLiteral)(line.toString())), (0, types_1.jsxAttribute)((0, types_1.jsxIdentifier)("inspector-column"), (0, types_1.stringLiteral)(column.toString())), (0, types_1.jsxAttribute)((0, types_1.jsxIdentifier)("inspector-filename"), (0, types_1.stringLiteral)(filename ? filename : currentFilename)), (0, types_1.jsxAttribute)((0, types_1.jsxIdentifier)("inspector-component-name"), (0, types_1.stringLiteral)(componentNames[index] ? componentNames[index] : "")));
                },
            },
            FunctionDeclaration: {
                enter(path) {
                    var _a;
                    const { node } = path;
                    const parentIsSequenceExpression = (0, types_1.isSequenceExpression)(path.parentPath.node);
                    //const a = (0,function(){})
                    if (parentIsSequenceExpression &&
                        (0, types_1.isVariableDeclarator)((_a = path.parentPath.parentPath) === null || _a === void 0 ? void 0 : _a.node) &&
                        (0, types_1.isIdentifier)(path.parentPath.parentPath.node.id)) {
                        componentNames.push(path.parentPath.parentPath.node.id.name);
                        return;
                    }
                    //const a = function(){}
                    if ((0, types_1.isVariableDeclarator)(path.parentPath.node) &&
                        (0, types_1.isIdentifier)(path.parentPath.node.id)) {
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
                    if ((0, types_1.isVariableDeclarator)(path.parentPath.node) &&
                        (0, types_1.isIdentifier)(path.parentPath.node.id)) {
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
exports.babelInjectPlugin = babelInjectPlugin;
