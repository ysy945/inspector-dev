import type { Fiber } from "react-reconciler";

export const isNativeTagFiber = (fiber?: Fiber): boolean =>
  typeof fiber?.type === "string";

export const isReactSymbolFiber = (fiber?: Fiber): boolean =>
  typeof fiber?.type?.$$typeof === "symbol";

export const isForwardRef = (fiber?: Fiber): boolean =>
  fiber?.type?.$$typeof === Symbol.for("react.forward_ref");

type FiberHTMLElement = HTMLElement & {
  [fiberKey: string]: Fiber | undefined;
};

export const getElementFiber = (
  element: FiberHTMLElement
): Fiber | undefined => {
  const fiberKey = Object.keys(element).find(
    (key) =>
      key.startsWith("__reactInternalInstance$") ||
      key.startsWith("__reactFiber$")
  );

  if (fiberKey) {
    return element[fiberKey] as Fiber;
  }

  return undefined;
};

export const getElementFiberUpward = (
  element: HTMLElement | null
): Fiber | undefined => {
  if (!element) return undefined;
  const fiber = getElementFiber(element as FiberHTMLElement);
  if (fiber) return fiber;
  return getElementFiberUpward(element.parentElement);
};

export const getDirectParentFiber = (child: Fiber): Fiber | null => {
  let current = child.return;
  while (current) {
    if (!isReactSymbolFiber(current)) {
      return current;
    }
    current = current.return;
  }
  return null;
};

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

export const getFiberName = (fiber?: Fiber): string => {
  const fiberType = fiber?.type;
  if (!fiberType) return "null";

  if (typeof fiberType === "string") return fiberType;
  else if (typeof fiberType === "function") {
    return fiberType.name || fiberType.displayName;
  } else if (typeof fiberType === "symbol") {
    return symbolToStringMap[fiberType as any];
  }

  return "null";
};
