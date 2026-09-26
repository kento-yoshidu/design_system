import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // ビルドの入口。ここからexportしたものがライブラリとして公開される
      entry: resolve(import.meta.dirname, "src/index.ts"),
      // ESMだけ出力する（Studio・PlaygroundはどちらもViteなのでこれで足りる）
      formats: ["es"],
      // dist/index.js になる
      fileName: "index",
      // dist/style.css になる
      cssFileName: "style",
    },
    rolldownOptions: {
      // Reactは利用側のものを使うので、dist/ に同梱しない
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
