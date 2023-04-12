import { useCallback } from "react";
let iframesListeningTo = new Set();
export function useSetupHighlighter(handlers) {
    const startInspectingNative = useCallback(function () {
        registerListenersOnWindow(window);
    }, []);
    const registerListenersOnWindow = useCallback(function (window) {
        // This plug-in may run in non-DOM environments (e.g. React Native).
        if (window && typeof window.addEventListener === "function") {
            window.addEventListener("click", onClick, true);
            window.addEventListener("mousedown", onMouseEvent, true);
            window.addEventListener("mouseover", onMouseEvent, true);
            window.addEventListener("mouseup", onMouseEvent, true);
            window.addEventListener("pointerdown", onPointerDown, true);
            window.addEventListener("pointerover", onPointerOver, true);
            window.addEventListener("pointerup", onPointerUp, true);
        }
    }, []);
    const stopInspectingNative = useCallback(function stopInspectingNative() {
        removeListenersOnWindow(window);
        iframesListeningTo.forEach(function (frame) {
            try {
                removeListenersOnWindow(frame.contentWindow);
            }
            catch (error) {
                // This can error when the iframe is on a cross-origin.
            }
        });
        iframesListeningTo = new Set();
    }, []);
    const removeListenersOnWindow = useCallback(function removeListenersOnWindow(window) {
        // This plug-in may run in non-DOM environments (e.g. React Native).
        if (window && typeof window.removeEventListener === "function") {
            window.removeEventListener("click", onClick, true);
            window.removeEventListener("mousedown", onMouseEvent, true);
            window.removeEventListener("mouseover", onMouseEvent, true);
            window.removeEventListener("mouseup", onMouseEvent, true);
            window.removeEventListener("pointerdown", onPointerDown, true);
            window.removeEventListener("pointerover", onPointerOver, true);
            window.removeEventListener("pointerup", onPointerUp, true);
        }
    }, []);
    const onClick = useCallback(function onClick(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        (_a = handlers.onClick) === null || _a === void 0 ? void 0 : _a.call(handlers, event.target);
    }, []);
    const onMouseEvent = useCallback(function onMouseEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    const onPointerDown = useCallback(function onPointerDown(event) {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    const onPointerOver = useCallback(function onPointerOver(event) {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        const target = event.target;
        if (target.tagName === "IFRAME") {
            const iframe = target;
            try {
                if (!iframesListeningTo.has(iframe)) {
                    const window = iframe.contentWindow;
                    registerListenersOnWindow(window);
                    iframesListeningTo.add(iframe);
                }
            }
            catch (error) {
                // This can error when the iframe is on a cross-origin.
            }
        }
        (_a = handlers.onPointerOver) === null || _a === void 0 ? void 0 : _a.call(handlers, event.target);
    }, []);
    const onPointerUp = useCallback(function onPointerUp(event) {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    return [startInspectingNative, stopInspectingNative];
}
