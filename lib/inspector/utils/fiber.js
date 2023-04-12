"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiberName = exports.getDirectParentFiber = exports.getElementFiberUpward = exports.getElementFiber = exports.isForwardRef = exports.isReactSymbolFiber = exports.isNativeTagFiber = void 0;
const isNativeTagFiber = (fiber) => typeof (fiber === null || fiber === void 0 ? void 0 : fiber.type) === "string";
exports.isNativeTagFiber = isNativeTagFiber;
const isReactSymbolFiber = (fiber) => { var _a; return typeof ((_a = fiber === null || fiber === void 0 ? void 0 : fiber.type) === null || _a === void 0 ? void 0 : _a.$$typeof) === "symbol"; };
exports.isReactSymbolFiber = isReactSymbolFiber;
const isForwardRef = (fiber) => { var _a; return ((_a = fiber === null || fiber === void 0 ? void 0 : fiber.type) === null || _a === void 0 ? void 0 : _a.$$typeof) === Symbol.for("react.forward_ref"); };
exports.isForwardRef = isForwardRef;
const getElementFiber = (element) => {
    const fiberKey = Object.keys(element).find((key) => key.startsWith("__reactInternalInstance$") ||
        key.startsWith("__reactFiber$"));
    if (fiberKey) {
        return element[fiberKey];
    }
    return undefined;
};
exports.getElementFiber = getElementFiber;
const getElementFiberUpward = (element) => {
    if (!element)
        return undefined;
    const fiber = (0, exports.getElementFiber)(element);
    if (fiber)
        return fiber;
    return (0, exports.getElementFiberUpward)(element.parentElement);
};
exports.getElementFiberUpward = getElementFiberUpward;
const getDirectParentFiber = (child) => {
    let current = child.return;
    while (current) {
        if (!(0, exports.isReactSymbolFiber)(current)) {
            return current;
        }
        current = current.return;
    }
    return null;
};
exports.getDirectParentFiber = getDirectParentFiber;
const hasSymbol = typeof Symbol === "function" && Symbol.for;
const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 0xeaca;
const REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 0xeacb;
const REACT_STRICT_MODE_TYPE = hasSymbol
    ? Symbol.for("react.strict_mode")
    : 0xeacc;
const REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 0xead2;
const REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 0xeacd;
const REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 0xeace;
const REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 0xead1;
const symbolToStringMap = {
    [REACT_PORTAL_TYPE]: "<Portal/>",
    [REACT_FRAGMENT_TYPE]: "<Fragment/>",
    [REACT_STRICT_MODE_TYPE]: "<React.StrictMode/>",
    [REACT_PROFILER_TYPE]: "<Profiler/>",
    [REACT_PROVIDER_TYPE]: "<Provider/>",
    [REACT_CONTEXT_TYPE]: "<Context/>",
    [REACT_SUSPENSE_TYPE]: "<Suspense/>",
};
const getFiberName = (fiber) => {
    const fiberType = fiber === null || fiber === void 0 ? void 0 : fiber.type;
    if (!fiberType)
        return "null";
    if (typeof fiberType === "string")
        return fiberType;
    else if (typeof fiberType === "function") {
        return fiberType.name || fiberType.displayName;
    }
    else if (typeof fiberType === "symbol") {
        return symbolToStringMap[fiberType];
    }
    return "null";
};
exports.getFiberName = getFiberName;
