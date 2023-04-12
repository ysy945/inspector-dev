/**
 * mirror from https://github.com/facebook/react/blob/v16.13.1/packages/react-devtools-shared/src/backend/views/utils.js
 */
import { getElementDimensions, getNestedBoundingClientRect, } from "./utils/overlay";
// Note that the Overlay components are not affected by the active Theme,
// because they highlight elements in the main Chrome window (outside of devtools).
// The colors below were chosen to roughly match those used by Chrome devtools.
class OverlayRect {
    constructor(doc, container) {
        this.node = doc.createElement("div");
        this.border = doc.createElement("div");
        this.padding = doc.createElement("div");
        this.content = doc.createElement("div");
        this.border.style.borderColor = overlayStyles.border;
        this.padding.style.borderColor = overlayStyles.padding;
        this.content.style.backgroundColor = overlayStyles.background;
        Object.assign(this.node.style, {
            borderColor: overlayStyles.margin,
            pointerEvents: "none",
            position: "fixed",
        });
        this.node.style.zIndex = "100000";
        this.node.appendChild(this.border);
        this.border.appendChild(this.padding);
        this.padding.appendChild(this.content);
        // ensure OverlayRect dom always before OverlayTip dom rather than cover OverlayTip
        container.prepend(this.node);
    }
    remove() {
        if (this.node.parentNode) {
            this.node.parentNode.removeChild(this.node);
        }
    }
    update(box, dims) {
        boxWrap(dims, "margin", this.node);
        boxWrap(dims, "border", this.border);
        boxWrap(dims, "padding", this.padding);
        Object.assign(this.content.style, {
            height: `${box.height -
                dims.borderTop -
                dims.borderBottom -
                dims.paddingTop -
                dims.paddingBottom}px`,
            width: `${box.width -
                dims.borderLeft -
                dims.borderRight -
                dims.paddingLeft -
                dims.paddingRight}px`,
        });
        Object.assign(this.node.style, {
            top: `${box.top - dims.marginTop}px`,
            left: `${box.left - dims.marginLeft}px`,
        });
    }
}
class OverlayTip {
    constructor(doc, container) {
        this.tip = doc.createElement("div");
        Object.assign(this.tip.style, {
            display: "flex",
            flexFlow: "row nowrap",
            alignItems: "center",
            backgroundColor: "#333740",
            borderRadius: "2px",
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
            fontWeight: "bold",
            padding: "6px 8px",
            pointerEvents: "none",
            position: "fixed",
            fontSize: "12px",
            whiteSpace: "nowrap",
        });
        this.nameSpan = doc.createElement("span");
        this.tip.appendChild(this.nameSpan);
        Object.assign(this.nameSpan.style, {
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #aaaaaa",
            paddingRight: "0.8rem",
            marginRight: "0.8rem",
        });
        this.titleDiv = doc.createElement("div");
        this.nameSpan.appendChild(this.titleDiv);
        Object.assign(this.titleDiv.style, {
            color: "#ee78e6",
            fontSize: "16px",
        });
        this.infoDiv = doc.createElement("div");
        this.nameSpan.appendChild(this.infoDiv);
        Object.assign(this.infoDiv.style, {
            color: "#ee78e6",
            fontSize: "14px",
        });
        this.dimSpan = doc.createElement("span");
        this.tip.appendChild(this.dimSpan);
        Object.assign(this.dimSpan.style, {
            color: "#d7d7d7",
        });
        this.tip.style.zIndex = "100002";
        container.appendChild(this.tip);
    }
    remove() {
        if (this.tip.parentNode) {
            this.tip.parentNode.removeChild(this.tip);
        }
    }
    updateText(name, info, width, height) {
        this.titleDiv.textContent = name;
        this.infoDiv.textContent = info !== null && info !== void 0 ? info : "";
        this.dimSpan.textContent = `${Math.round(width)}px × ${Math.round(height)}px`;
    }
    updatePosition(dims, bounds) {
        const tipRect = this.tip.getBoundingClientRect();
        const tipPos = findTipPos(dims, bounds, {
            width: tipRect.width,
            height: tipRect.height,
        });
        Object.assign(this.tip.style, tipPos.style);
    }
}
export default class Overlay {
    constructor() {
        this.isOpen = false;
        this.keyBoardStateOpen = false;
        this.isInspect = false;
        const currentWindow = window;
        this.window = currentWindow;
        const tipBoundsWindow = window;
        this.tipBoundsWindow = tipBoundsWindow;
        const doc = currentWindow.document;
        this.container = doc.createElement("div");
        this.container.style.zIndex = "100000";
        this.tip = new OverlayTip(doc, this.container);
        this.rects = [];
        this.removeCallback = () => { };
        this.closeCallback = () => { };
        doc.body.appendChild(this.container);
    }
    remove() {
        this.isInspect = false;
        this.tip.remove();
        this.rects.forEach((rect) => {
            rect.remove();
        });
        this.rects.length = 0;
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.removeCallback();
    }
    setRemoveCallback(callback) {
        this.removeCallback = callback.bind(this);
    }
    setCloseCallback(callback) {
        this.closeCallback = callback.bind(this);
    }
    inspect(nodes, name, info) {
        this.isInspect = true;
        this.isOpen = true;
        const elements = nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE);
        while (this.rects.length > elements.length) {
            const rect = this.rects.pop();
            rect === null || rect === void 0 ? void 0 : rect.remove();
        }
        if (elements.length === 0) {
            return;
        }
        while (this.rects.length < elements.length) {
            this.rects.push(new OverlayRect(this.window.document, this.container));
        }
        const outerBox = {
            top: Number.POSITIVE_INFINITY,
            right: Number.NEGATIVE_INFINITY,
            bottom: Number.NEGATIVE_INFINITY,
            left: Number.POSITIVE_INFINITY,
        };
        elements.forEach((element, index) => {
            const box = getNestedBoundingClientRect(element, this.window);
            const dims = getElementDimensions(element);
            outerBox.top = Math.min(outerBox.top, box.top - dims.marginTop);
            outerBox.right = Math.max(outerBox.right, box.left + box.width + dims.marginRight);
            outerBox.bottom = Math.max(outerBox.bottom, box.top + box.height + dims.marginBottom);
            outerBox.left = Math.min(outerBox.left, box.left - dims.marginLeft);
            const rect = this.rects[index];
            rect.update(box, dims);
        });
        if (!name) {
            name = elements[0].nodeName.toLowerCase();
        }
        this.tip.updateText(name, info, outerBox.right - outerBox.left, outerBox.bottom - outerBox.top);
        const tipBounds = getNestedBoundingClientRect(this.tipBoundsWindow.document.documentElement, this.window);
        this.tip.updatePosition({
            top: outerBox.top,
            left: outerBox.left,
            height: outerBox.bottom - outerBox.top,
            width: outerBox.right - outerBox.left,
        }, {
            top: tipBounds.top + this.tipBoundsWindow.scrollY,
            left: tipBounds.left + this.tipBoundsWindow.scrollX,
            height: this.tipBoundsWindow.innerHeight,
            width: this.tipBoundsWindow.innerWidth,
        });
    }
    open(isKeyBoardCtrl = true, callback) {
        //当前是离开displayer情况的open
        if ((!isKeyBoardCtrl && this.keyBoardStateOpen) || isKeyBoardCtrl) {
            this.container.style.display = "block";
            this.isOpen = true;
            callback();
        }
    }
    close(isKeyBoardCtrl = true) {
        if (isKeyBoardCtrl) {
            this.keyBoardStateOpen = false;
        }
        // 当前是进入displayer情况的open
        if (!isKeyBoardCtrl) {
            this.keyBoardStateOpen = this.isOpen;
        }
        this.container.style.display = "none";
        this.isOpen = false;
        this.closeCallback();
    }
}
function findTipPos(dims, bounds, tipSize) {
    const tipHeight = Math.max(tipSize.height, 20);
    const tipWidth = Math.max(tipSize.width, 60);
    const margin = 5;
    let top;
    if (dims.top + dims.height + tipHeight <= bounds.top + bounds.height) {
        if (dims.top + dims.height < bounds.top + 0) {
            top = bounds.top + margin;
        }
        else {
            top = dims.top + dims.height + margin;
        }
    }
    else if (dims.top - tipHeight <= bounds.top + bounds.height) {
        if (dims.top - tipHeight - margin < bounds.top + margin) {
            top = bounds.top + margin;
        }
        else {
            top = dims.top - tipHeight - margin;
        }
    }
    else {
        top = bounds.top + bounds.height - tipHeight - margin;
    }
    let left = dims.left + margin;
    if (dims.left < bounds.left) {
        left = bounds.left + margin;
    }
    if (dims.left + tipWidth > bounds.left + bounds.width) {
        left = bounds.left + bounds.width - tipWidth - margin;
    }
    return {
        style: {
            top: `${top}px`,
            left: `${left}px`,
        },
    };
}
function boxWrap(dims, what, node) {
    Object.assign(node.style, {
        borderTopWidth: `${dims[`${what}Top`]}px`,
        borderLeftWidth: `${dims[`${what}Left`]}px`,
        borderRightWidth: `${dims[`${what}Right`]}px`,
        borderBottomWidth: `${dims[`${what}Bottom`]}px`,
        borderStyle: "solid",
    });
}
const overlayStyles = {
    background: "rgba(120, 170, 210, 0.7)",
    padding: "rgba(77, 200, 0, 0.3)",
    margin: "rgba(255, 155, 0, 0.3)",
    border: "rgba(255, 200, 50, 0.3)",
};
