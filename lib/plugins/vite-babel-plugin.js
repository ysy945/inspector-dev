"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViteInspectorPlugin = void 0;
const core_1 = require("@babel/core");
const babel_plugin_1 = require("./babel-plugin");
function ViteInspectorPlugin() {
    return {
        name: "vite-inspector-inject-plugin",
        enforce: "pre",
        transform(code, id) {
            return __awaiter(this, void 0, void 0, function* () {
                const sourceMap = this.getCombinedSourcemap();
                let transformCode;
                let transformMap;
                if (/.[jt]sx$/.test(id)) {
                    const result = (0, core_1.transformSync)(code, {
                        filename: id,
                        parserOpts: {
                            plugins: ["typescript", "jsx"],
                        },
                        plugins: [(0, babel_plugin_1.babelInjectPlugin)(id)],
                    });
                    transformCode = (result === null || result === void 0 ? void 0 : result.code) || undefined;
                    transformMap = (result === null || result === void 0 ? void 0 : result.map) || undefined;
                }
                return {
                    code: transformCode || code,
                    map: transformMap || sourceMap,
                };
            });
        },
    };
}
exports.ViteInspectorPlugin = ViteInspectorPlugin;
