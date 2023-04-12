import { PluginOption } from "vite";
import { transformSync, BabelFileResult } from "@babel/core";
import { babelInjectPlugin } from "./babel-plugin";

export function ViteInspectorPlugin(): PluginOption {
  return {
    name: "vite-inspector-inject-plugin",
    enforce: "pre",
    async transform(code, id) {
      const sourceMap = this.getCombinedSourcemap();
      let transformCode: string | null | undefined;
      let transformMap: BabelFileResult["map"];
      if (/.[jt]sx$/.test(id)) {
        const result = transformSync(code, {
          filename: id,
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
          plugins: [babelInjectPlugin(id)],
        });
        transformCode = result?.code || undefined;
        transformMap = result?.map || undefined;
      }
      return {
        code: transformCode || code,
        map: transformMap || sourceMap,
      };
    },
  };
}
