import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel / local / custom domain serve at root "/".
// The GitHub Pages workflow sets GITHUB_PAGES=true to use the repo subpath.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/Nuit.bxl/" : "/",
});
