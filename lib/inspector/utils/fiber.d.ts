import type { Fiber } from "react-reconciler";
export declare const isNativeTagFiber: (fiber?: Fiber) => boolean;
export declare const isReactSymbolFiber: (fiber?: Fiber) => boolean;
export declare const isForwardRef: (fiber?: Fiber) => boolean;
type FiberHTMLElement = HTMLElement & {
    [fiberKey: string]: Fiber | undefined;
};
export declare const getElementFiber: (element: FiberHTMLElement) => Fiber | undefined;
export declare const getElementFiberUpward: (element: HTMLElement | null) => Fiber | undefined;
export declare const getDirectParentFiber: (child: Fiber) => Fiber | null;
export declare const getFiberName: (fiber?: Fiber) => string;
export {};
