import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxDev: false,
    jsxImportSource: "maccheroni",
    jsxInject: "import { jsx } from 'maccheroni/jsx-runtime'",
    jsxFactory: "jsx.createElement",
    jsxFragment: "jsx.createFragment",
  },

  server: {
    port: 5175,
  },
});
