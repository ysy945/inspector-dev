import type { Fiber } from "react-reconciler";
export interface CodeInfo {
    lineNumber: string;
    columnNumber: string;
    relativePath?: string;
    absolutePath?: string;
}
export declare const getCodeInfoFromDebugSource: (fiber?: Fiber) => CodeInfo | undefined;
export declare const getFiberProps: (element: HTMLElement) => any;
export declare const getFiber: (element: HTMLElement) => {};
export interface AllCodeInfo {
    inspectorFilename?: string;
    inspectorComponentName?: string;
    column?: string;
    line?: string;
    name?: string;
    parent?: AllCodeInfo;
}
export declare function isUpperCase(str: string): boolean;
export declare const getAllCodeInfo: (fiber: Fiber) => AllCodeInfo;
