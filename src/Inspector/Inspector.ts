import React, { useEffect, useRef, useCallback, useMemo } from "react";
import type { Fiber } from "react-reconciler";
import hotkeys, { KeyHandler } from "hotkeys-js";
import { useSetupHighlighter } from "./utils/highlight";
import {
  CodeInfo,
  getAllCodeInfo,
  getFiber,
  getFiberProps,
} from "./utils/inspect";
import Overlay from "./Overlay";
import Displayer from "./Displayer";
import { deleteAttribute } from "./utils/delete";
import go from "./utils/go";

const externalElements = new Set();
export function addExternalElement(element: HTMLElement) {
  externalElements.add(element);
}
export interface InspectParams {
  /** hover / click event target dom element */
  element: HTMLElement;
  /** nearest named react component fiber for dom element */
  fiber?: Fiber;
  /** source file line / column / path info for react component */
  codeInfo?: CodeInfo;
  /** react component name for dom element */
  name?: string;
}

export type ElementHandler = (params: InspectParams) => void;

export type Handlers = {
  onPointerOver: (element: HTMLElement) => void;
  onClick: (element: HTMLElement) => void;
};

export const defaultHotKeys = ["option", "c"];
export const defaultDisplayerHotKeys = ["option", "x"];

export interface InspectorProps {
  displayerKeys?: string[];
  keys?: string[];
  onHoverElement?: ElementHandler;
  onClickElement?: ElementHandler;
  disableLaunchEditor?: boolean;
  children?: JSX.Element;
}

export const Inspector: React.FC<InspectorProps> = (props) => {
  const {
    displayerKeys,
    keys,
    onHoverElement,
    onClickElement,
    disableLaunchEditor,
    children,
  } = props;

  const hotkey = (keys ?? defaultHotKeys).join("+");
  const displayerHotKeys = (displayerKeys ?? defaultDisplayerHotKeys).join("+");
  const overlayRef = useRef<Overlay>();
  const displayerRef = useRef<Displayer>();
  const mousePointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const recordMousePoint = ({ clientX, clientY }: MouseEvent) => {
    mousePointRef.current.x = clientX;
    mousePointRef.current.y = clientY;
  };

  const handleHoverElement = useCallback((element: HTMLElement) => {
    const overlay = overlayRef.current;
    const fiberProps = getFiberProps(element); //获取注入的props
    const inspectorFilename = fiberProps["inspector-filename"];
    const inspectorComponentName = fiberProps["inspector-component-name"];
    const column = fiberProps["inspector-column"];
    const line = fiberProps["inspector-line"];
    if (externalElements.has(element)) {
      return;
    }

    overlay?.inspect?.(
      [element],
      inspectorComponentName
        ? `${element.localName} in <${inspectorComponentName}/>`
        : element.localName,
      (inspectorFilename ? inspectorFilename : "") +
        (line && column ? `:${line}:${column}` : "")
    );

    // onHoverElement?.({
    //   element,
    //   fiber,
    //   codeInfo,
    //   name,
    // });
  }, []);

  const handleClickElement = useCallback((element: HTMLElement) => {
    if (externalElements.has(element)) return;
    const fiberProps = getFiberProps(element);
    const allCodeInfo = getAllCodeInfo(getFiber(element) as Fiber);
    displayerRef.current?.addItem(allCodeInfo);
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

  const [startInspectingNative, stopInspectingNative] =
    useSetupHighlighter(handlers);

  const startInspect = useCallback((isKeyBoardCtrl: boolean = true) => {
    if (!overlayRef.current) overlayRef.current = new Overlay();
    const overlay = overlayRef.current;
    overlay.setCloseCallback(stopInspectingNative);
    overlayRef.current.open(isKeyBoardCtrl, function () {
      startInspectingNative();

      // inspect element immediately at mouse point
      const initPoint = mousePointRef.current;
      const initElement = document.elementFromPoint(initPoint.x, initPoint.y);
      if (initElement) handleHoverElement(initElement as HTMLElement);
    });
  }, []);

  const stopInspect = useCallback((isKeyBoardCtrl: boolean = true) => {
    overlayRef.current?.close(isKeyBoardCtrl);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", recordMousePoint, true);
    return () => {
      document.removeEventListener("mousemove", recordMousePoint, true);
    };
  }, []);

  useEffect(() => {
    const handleHotKeys: KeyHandler = (event, handler) => {
      if (handler.key === hotkey) {
        if (overlayRef.current?.isOpen) {
          stopInspect();
        } else startInspect();
      } else if (handler.key === displayerHotKeys) {
        const displayer = (displayerRef.current = displayerRef.current
          ? displayerRef.current
          : new Displayer(startInspect, stopInspect));

        if (displayerRef.current.isAppend === false) {
          return displayer.append();
        }
        displayer.isOpen ? displayer.close() : displayer.open();
      } else if (handler.key === "esc" && overlayRef.current) {
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

  return React.createElement(React.Fragment, {}, children ?? null);
};
