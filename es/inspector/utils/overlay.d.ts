export interface Rect {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
}
export interface BoxSizing {
    borderTop: number;
    borderBottom: number;
    borderLeft: number;
    borderRight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}
export declare function getNestedBoundingClientRect(node: HTMLElement, boundaryWindow: Window | HTMLElement): Rect;
export declare function getElementDimensions(domElement: Element): {
    borderLeft: number;
    borderRight: number;
    borderTop: number;
    borderBottom: number;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
};
