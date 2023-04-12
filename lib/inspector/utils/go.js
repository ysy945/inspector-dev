"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function go(filePath, line, column) {
    let path = "";
    if (!filePath)
        return;
    path += filePath;
    if (line && !column)
        path += `:${line}`;
    else if (line && column)
        path += `:${line}:${column}`;
    window.open(`vscode://file${path}`);
}
exports.default = go;
