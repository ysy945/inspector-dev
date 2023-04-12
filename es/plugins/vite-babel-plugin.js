var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { transformSync } from "@babel/core";
import { babelInjectPlugin } from "./babel-plugin.js";
export function ViteInspectorPlugin() {
  return {
    name: "vite-inspector-inject-plugin",
    enforce: "pre",
    transform(code, id) {
      return __awaiter(this, void 0, void 0, function* () {
        const sourceMap = this.getCombinedSourcemap();
        let transformCode;
        let transformMap;
        if (/.[jt]sx$/.test(id)) {
          const result = transformSync(code, {
            filename: id,
            parserOpts: {
              plugins: ["typescript", "jsx"],
            },
            plugins: [babelInjectPlugin(id)],
          });
          transformCode =
            (result === null || result === void 0 ? void 0 : result.code) ||
            undefined;
          transformMap =
            (result === null || result === void 0 ? void 0 : result.map) ||
            undefined;
        }
        return {
          code: transformCode || code,
          map: transformMap || sourceMap,
        };
      });
    },
  };
}
