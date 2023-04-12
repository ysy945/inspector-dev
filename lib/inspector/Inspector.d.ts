import React from "react";
import type { Fiber } from "react-reconciler";
import { CodeInfo } from "./utils/inspect";
export declare function addExternalElement(element: HTMLElement): void;
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
export declare const defaultHotKeys: string[];
export declare const defaultDisplayerHotKeys: string[];
export interface InspectorProps {
    displayerKeys?: string[];
    keys?: string[];
    onHoverElement?: ElementHandler;
    onClickElement?: ElementHandler;
    disableLaunchEditor?: boolean;
    children?: JSX.Element;
}
export declare const Inspector: React.FC<InspectorProps>;
