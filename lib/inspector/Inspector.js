"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspector = exports.defaultDisplayerHotKeys = exports.defaultHotKeys = exports.addExternalElement = void 0;
const react_1 = __importStar(require("react"));
const hotkeys_js_1 = __importDefault(require("hotkeys-js"));
const highlight_1 = require("./utils/highlight");
const inspect_1 = require("./utils/inspect");
const Overlay_1 = __importDefault(require("./Overlay"));
const Displayer_1 = __importDefault(require("./Displayer"));
const delete_1 = require("./utils/delete");
const go_1 = __importDefault(require("./utils/go"));
const externalElements = new Set();
function addExternalElement(element) {
    externalElements.add(element);
}
exports.addExternalElement = addExternalElement;
exports.defaultHotKeys = ["option", "c"];
exports.defaultDisplayerHotKeys = ["option", "x"];
const Inspector = (props) => {
    const { displayerKeys, keys, onHoverElement, onClickElement, disableLaunchEditor, children, } = props;
    const hotkey = (keys !== null && keys !== void 0 ? keys : exports.defaultHotKeys).join("+");
    const displayerHotKeys = (displayerKeys !== null && displayerKeys !== void 0 ? displayerKeys : exports.defaultDisplayerHotKeys).join("+");
    const overlayRef = (0, react_1.useRef)();
    const displayerRef = (0, react_1.useRef)();
    const mousePointRef = (0, react_1.useRef)({ x: 0, y: 0 });
    const recordMousePoint = ({ clientX, clientY }) => {
        mousePointRef.current.x = clientX;
        mousePointRef.current.y = clientY;
    };
    const handleHoverElement = (0, react_1.useCallback)((element) => {
        var _a;
        const overlay = overlayRef.current;
        const fiberProps = (0, inspect_1.getFiberProps)(element); //获取注入的props
        const inspectorFilename = fiberProps["inspector-filename"];
        const inspectorComponentName = fiberProps["inspector-component-name"];
        const column = fiberProps["inspector-column"];
        const line = fiberProps["inspector-line"];
        if (externalElements.has(element)) {
            return;
        }
        (_a = overlay === null || overlay === void 0 ? void 0 : overlay.inspect) === null || _a === void 0 ? void 0 : _a.call(overlay, [element], inspectorComponentName
            ? `${element.localName} in <${inspectorComponentName}/>`
            : element.localName, (inspectorFilename ? inspectorFilename : "") +
            (line && column ? `:${line}:${column}` : ""));
        // onHoverElement?.({
        //   element,
        //   fiber,
        //   codeInfo,
        //   name,
        // });
    }, []);
    const handleClickElement = (0, react_1.useCallback)((element) => {
        var _a;
        if (externalElements.has(element))
            return;
        const fiberProps = (0, inspect_1.getFiberProps)(element);
        const allCodeInfo = (0, inspect_1.getAllCodeInfo)((0, inspect_1.getFiber)(element));
        (_a = displayerRef.current) === null || _a === void 0 ? void 0 : _a.addItem(allCodeInfo);
        // displayerRef.current?.active(element);
        let inspectorFilename = undefined;
        let inspectorColumn = fiberProps["inspector-column"];
        let inspectorLine = fiberProps["inspector-line"];
        if (fiberProps) {
            inspectorFilename = fiberProps["inspector-filename"];
            inspectorColumn = fiberProps["inspector-column"];
            inspectorLine = fiberProps["inspector-line"];
            (0, go_1.default)(inspectorFilename, inspectorLine, inspectorColumn);
        }
        // onClickElement?.({
        //   element,
        //   fiber,
        //   codeInfo,
        //   name,
        // });
    }, []);
    const handlers = (0, react_1.useMemo)(() => {
        return {
            onPointerOver: handleHoverElement,
            onClick: handleClickElement,
        };
    }, []);
    const [startInspectingNative, stopInspectingNative] = (0, highlight_1.useSetupHighlighter)(handlers);
    const startInspect = (0, react_1.useCallback)((isKeyBoardCtrl = true) => {
        if (!overlayRef.current)
            overlayRef.current = new Overlay_1.default();
        const overlay = overlayRef.current;
        overlay.setCloseCallback(stopInspectingNative);
        overlayRef.current.open(isKeyBoardCtrl, function () {
            startInspectingNative();
            // inspect element immediately at mouse point
            const initPoint = mousePointRef.current;
            const initElement = document.elementFromPoint(initPoint.x, initPoint.y);
            if (initElement)
                handleHoverElement(initElement);
        });
    }, []);
    const stopInspect = (0, react_1.useCallback)((isKeyBoardCtrl = true) => {
        var _a;
        (_a = overlayRef.current) === null || _a === void 0 ? void 0 : _a.close(isKeyBoardCtrl);
    }, []);
    (0, react_1.useEffect)(() => {
        document.addEventListener("mousemove", recordMousePoint, true);
        return () => {
            document.removeEventListener("mousemove", recordMousePoint, true);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        const handleHotKeys = (event, handler) => {
            var _a;
            if (handler.key === hotkey) {
                if ((_a = overlayRef.current) === null || _a === void 0 ? void 0 : _a.isOpen) {
                    stopInspect();
                }
                else
                    startInspect();
            }
            else if (handler.key === displayerHotKeys) {
                const displayer = (displayerRef.current = displayerRef.current
                    ? displayerRef.current
                    : new Displayer_1.default(startInspect, stopInspect));
                if (displayerRef.current.isAppend === false) {
                    return displayer.append();
                }
                displayer.isOpen ? displayer.close() : displayer.open();
            }
            else if (handler.key === "esc" && overlayRef.current) {
                stopInspect();
            }
        };
        (0, hotkeys_js_1.default)(`${hotkey}, esc ,${displayerHotKeys}`, handleHotKeys);
        return () => {
            hotkeys_js_1.default.unbind(`${hotkey}, esc,${displayerHotKeys}`, handleHotKeys);
        };
    }, [hotkey, displayerHotKeys]);
    (0, react_1.useEffect)(() => {
        (0, delete_1.deleteAttribute)();
    });
    return react_1.default.createElement(react_1.default.Fragment, {}, children !== null && children !== void 0 ? children : null);
};
exports.Inspector = Inspector;
