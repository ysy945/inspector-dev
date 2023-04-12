"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCodeInfo = exports.isUpperCase = exports.getFiber = exports.getFiberProps = exports.getCodeInfoFromDebugSource = void 0;
const fiber_1 = require("./fiber");
const getCodeInfoFromDebugSource = (fiber) => {
    if (!(fiber === null || fiber === void 0 ? void 0 : fiber._debugSource))
        return undefined;
    const { fileName, lineNumber, columnNumber } = fiber._debugSource;
    if (fileName && lineNumber) {
        return {
            lineNumber: String(lineNumber),
            columnNumber: String(columnNumber !== null && columnNumber !== void 0 ? columnNumber : 1),
            absolutePath: fileName,
        };
    }
    return undefined;
};
exports.getCodeInfoFromDebugSource = getCodeInfoFromDebugSource;
const getFiberProps = function (element) {
    for (let key in element) {
        if (key.startsWith("__reactProps")) {
            return element[key];
        }
    }
    return {};
};
exports.getFiberProps = getFiberProps;
const getFiber = function (element) {
    for (let key in element) {
        if (key.startsWith("__reactFiber")) {
            return element[key];
        }
    }
    return {};
};
exports.getFiber = getFiber;
function isUpperCase(str) {
    return str.toUpperCase() === str;
}
exports.isUpperCase = isUpperCase;
const getAllCodeInfo = function (fiber) {
    const result = {};
    function getCodeInfo(fiber, child, isFirst) {
        const { pendingProps = {} } = fiber;
        const isComponent = typeof fiber.elementType !== "string" &&
            !(fiber.pendingProps || {}).children;
        if (isComponent || isFirst) {
            child.inspectorFilename = pendingProps["inspector-filename"];
            child.inspectorComponentName = getInspectorComponentName(pendingProps);
            child.column = pendingProps["inspector-column"];
            child.line = pendingProps["inspector-line"];
            child.name = (0, fiber_1.getFiberName)(fiber);
        }
        if (fiber.return && fiber.return.return) {
            if (isComponent || isFirst) {
                child.parent = getCodeInfo(fiber.return, {}, false);
            }
            else {
                return getCodeInfo(fiber.return, child, false);
            }
        }
        return child;
    }
    getCodeInfo(fiber, result, true);
    return result;
};
exports.getAllCodeInfo = getAllCodeInfo;
function getInspectorComponentName(pendingProps) {
    const inspectorComponentName = pendingProps["inspector-component-name"];
    if (!inspectorComponentName)
        return "";
    return inspectorComponentName.startsWith("<")
        ? inspectorComponentName
        : `<${inspectorComponentName}/>`;
}
