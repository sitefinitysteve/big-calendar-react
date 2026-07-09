import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      include: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "big-calendar-react",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "date-fns",
        "zustand",
        "zustand/shallow",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "react-hook-form",
        "@hookform/resolvers",
        "@hookform/resolvers/zod",
        "zod",
        "react-day-picker",
        // Base UI is a peer dependency; externalize the package and all of its
        // subpath entry points (@base-ui/react/dialog, /use-render, …).
        /^@base-ui\//,
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: "style.[ext]",
      },
    },
  },
});
