import React, { useEffect, useRef, useCallback, useMemo } from "react";
import hotkeys from "hotkeys-js";
import { useSetupHighlighter } from "./utils/highlight";
import { getAllCodeInfo, getFiber, getFiberProps, } from "./utils/inspect";
import Overlay from "./Overlay";
import Displayer from "./Displayer";
import { deleteAttribute } from "./utils/delete";
import go from "./utils/go";
const externalElements = new Set();
export function addExternalElement(element) {
    externalElements.add(element);
}
export const defaultHotKeys = ["option", "c"];
export const defaultDisplayerHotKeys = ["option", "x"];
export const Inspector = (props) => {
    const { displayerKeys, keys, onHoverElement, onClickElement, disableLaunchEditor, children, } = props;
    const hotkey = (keys !== null && keys !== void 0 ? keys : defaultHotKeys).join("+");
    const displayerHotKeys = (displayerKeys !== null && displayerKeys !== void 0 ? displayerKeys : defaultDisplayerHotKeys).join("+");
    const overlayRef = useRef();
    const displayerRef = useRef();
    const mousePointRef = useRef({ x: 0, y: 0 });
    const recordMousePoint = ({ clientX, clientY }) => {
        mousePointRef.current.x = clientX;
        mousePointRef.current.y = clientY;
    };
    const handleHoverElement = useCallback((element) => {
        var _a;
        const overlay = overlayRef.current;
        const fiberProps = getFiberProps(element); //获取注入的props
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
    const handleClickElement = useCallback((element) => {
        var _a;
        if (externalElements.has(element))
            return;
        const fiberProps = getFiberProps(element);
        const allCodeInfo = getAllCodeInfo(getFiber(element));
        (_a = displayerRef.current) === null || _a === void 0 ? void 0 : _a.addItem(allCodeInfo);
        // displayerRef.current?.active(element);
        let inspectorFilename = undefined;
        let inspectorColumn = fiberProps["inspector-column"];
        let inspectorLine = fiberProps["inspector-line"];
        if (fiberProps) {
            inspectorFilename = fiberProps["inspector-filename"];
            inspectorColumn = fiberProps["inspector-column"];
            inspectorLine = fiberProps["inspector-line"];
            go(inspectorFilename, inspectorLine, inspectorColumn);
        }
        // onClickElement?.({
        //   element,
        //   fiber,
        //   codeInfo,
        //   name,
        // });
    }, []);
    const handlers = useMemo(() => {
        return {
            onPointerOver: handleHoverElement,
            onClick: handleClickElement,
        };
    }, []);
    const [startInspectingNative, stopInspectingNative] = useSetupHighlighter(handlers);
    const startInspect = useCallback((isKeyBoardCtrl = true) => {
        if (!overlayRef.current)
            overlayRef.current = new Overlay();
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
    const stopInspect = useCallback((isKeyBoardCtrl = true) => {
        var _a;
        (_a = overlayRef.current) === null || _a === void 0 ? void 0 : _a.close(isKeyBoardCtrl);
    }, []);
    useEffect(() => {
        document.addEventListener("mousemove", recordMousePoint, true);
        return () => {
            document.removeEventListener("mousemove", recordMousePoint, true);
        };
    }, []);
    useEffect(() => {
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
                    : new Displayer(startInspect, stopInspect));
                if (displayerRef.current.isAppend === false) {
                    return displayer.append();
                }
                displayer.isOpen ? displayer.close() : displayer.open();
            }
            else if (handler.key === "esc" && overlayRef.current) {
                stopInspect();
            }
        };
        hotkeys(`${hotkey}, esc ,${displayerHotKeys}`, handleHotKeys);
        return () => {
            hotkeys.unbind(`${hotkey}, esc,${displayerHotKeys}`, handleHotKeys);
        };
    }, [hotkey, displayerHotKeys]);
    useEffect(() => {
        deleteAttribute();
    });
    return React.createElement(React.Fragment, {}, children !== null && children !== void 0 ? children : null);
};
