"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttribute = void 0;
const attributes = [
    "inspector-line",
    "inspector-column",
    "inspector-filename",
    "inspector-component-name",
];
function deleteAttribute(dom = document.body) {
    const { children } = dom;
    attributes.forEach((attr) => {
        dom.removeAttribute(attr);
    });
    if (children) {
        for (let i = 0, l = children.length; i < l; i++) {
            deleteAttribute(children[i]);
        }
    }
}
exports.deleteAttribute = deleteAttribute;
