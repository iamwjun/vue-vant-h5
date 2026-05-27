import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    viteMockServe({
      mockPath: "mock",
      enable: command === "serve",
      logger: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
