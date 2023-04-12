import { useCallback } from "react";
import Displayer from "../Displayer";

let iframesListeningTo: Set<HTMLIFrameElement> = new Set();

export function useSetupHighlighter(handlers: {
  onPointerOver?: (element: HTMLElement) => void;
  onClick?: (element: HTMLElement) => void;
}) {
  const startInspectingNative = useCallback(function () {
    registerListenersOnWindow(window);
  }, []);

  const registerListenersOnWindow = useCallback(function (
    window?: Window | null
  ) {
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
  },
  []);

  const stopInspectingNative = useCallback(function stopInspectingNative() {
    removeListenersOnWindow(window);
    iframesListeningTo.forEach(function (frame) {
      try {
        removeListenersOnWindow(frame.contentWindow);
      } catch (error) {
        // This can error when the iframe is on a cross-origin.
      }
    });
    iframesListeningTo = new Set();
  }, []);

  const removeListenersOnWindow = useCallback(function removeListenersOnWindow(
    window?: Window | null
  ) {
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
  },
  []);

  const onClick = useCallback(function onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    handlers.onClick?.(event.target as HTMLElement);
  }, []);

  const onMouseEvent = useCallback(function onMouseEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onPointerDown = useCallback(function onPointerDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onPointerOver = useCallback(function onPointerOver(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;

    if (target.tagName === "IFRAME") {
      const iframe: HTMLIFrameElement = target as HTMLIFrameElement;
      try {
        if (!iframesListeningTo.has(iframe)) {
          const window = iframe.contentWindow;
          registerListenersOnWindow(window);
          iframesListeningTo.add(iframe);
        }
      } catch (error) {
        // This can error when the iframe is on a cross-origin.
      }
    }

    handlers.onPointerOver?.(event.target as HTMLElement);
  }, []);

  const onPointerUp = useCallback(function onPointerUp(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return [startInspectingNative, stopInspectingNative];
}
