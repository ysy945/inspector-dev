import type { Fiber, Source } from "react-reconciler";
import { getFiberName } from "./fiber";

export interface CodeInfo {
  lineNumber: string;
  columnNumber: string;
  relativePath?: string;
  absolutePath?: string;
}

export const getCodeInfoFromDebugSource = (
  fiber?: Fiber
): CodeInfo | undefined => {
  if (!fiber?._debugSource) return undefined;

  const { fileName, lineNumber, columnNumber } =
    fiber._debugSource as Source & { columnNumber?: number };

  if (fileName && lineNumber) {
    return {
      lineNumber: String(lineNumber),
      columnNumber: String(columnNumber ?? 1),
      absolutePath: fileName,
    };
  }

  return undefined;
};

export const getFiberProps = function (element: HTMLElement) {
  for (let key in element) {
    if (key.startsWith("__reactProps")) {
      return (element as any)[key];
    }
  }
  return {};
};

export const getFiber = function (element: HTMLElement) {
  for (let key in element) {
    if (key.startsWith("__reactFiber")) {
      return (element as any)[key] as Fiber;
    }
  }
  return {};
};

export interface AllCodeInfo {
  inspectorFilename?: string;
  inspectorComponentName?: string;
  column?: string;
  line?: string;
  name?: string;
  parent?: AllCodeInfo;
}

export function isUpperCase(str: string) {
  return str.toUpperCase() === str;
}

export const getAllCodeInfo = function (fiber: Fiber): AllCodeInfo {
  const result: AllCodeInfo = {};

  function getCodeInfo(
    fiber: Fiber,
    child: AllCodeInfo,
    isFirst: boolean
  ): AllCodeInfo {
    const { pendingProps = {} } = fiber;
    const isComponent =
      typeof fiber.elementType !== "string" &&
      !(fiber.pendingProps || {}).children;
    if (isComponent || isFirst) {
      child.inspectorFilename = pendingProps["inspector-filename"];
      child.inspectorComponentName = getInspectorComponentName(pendingProps);
      child.column = pendingProps["inspector-column"];
      child.line = pendingProps["inspector-line"];
      child.name = getFiberName(fiber);
    }
    if (fiber.return && fiber.return.return) {
      if (isComponent || isFirst) {
        child.parent = getCodeInfo(fiber.return, {}, false);
      } else {
        return getCodeInfo(fiber.return, child, false);
      }
    }
    return child;
  }
  getCodeInfo(fiber, result, true);
  return result;
};

function getInspectorComponentName(pendingProps: any) {
  const inspectorComponentName = pendingProps["inspector-component-name"];
  if (!inspectorComponentName) return "";
  return (inspectorComponentName as string).startsWith("<")
    ? inspectorComponentName
    : `<${inspectorComponentName}/>`;
}
