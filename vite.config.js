import { defineConfig } from "vite";
import path from "path";
import { globSync } from "glob";

export default defineConfig({
  build: {
    cssCodeSplit: true, // Separate CSS from JS
    rollupOptions: {
      input: getInputEntries(),
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId.includes("/components/")) {
            // Place component JS files in their respective directories
            const componentPath = path.relative(
              path.resolve(__dirname, "src"),
              facadeModuleId,
            );
            return `${componentPath}`;
          }
          // Other JS files go to the 'js' directory
          return "assets/js/[name].[hash].js";
        },
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.name || "";
          if (fileName.endsWith(".css")) {
            return "assets/css/[name].[hash].css";
          }
          if (fileName.endsWith(".scss")) {
            return "assets/css/[name].[hash].css";
          }
          return "assets/[name].[hash][extname]";
        },
        chunkFileNames: "assets/js/[name].[hash].js",
      },
    },
    outDir: "dist", // Output directory
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  publicDir: "public", // Static assets
  
});

function getInputEntries() {
  const entries = {};
  const htmlFiles = globSync(["*.html", "pages/*.html"], {
    ignore: "node_modules/**",
  });

  htmlFiles.forEach((file) => {
    const relativePath = path.relative(__dirname, file);
    const entryName = relativePath.replace(/\.html$/, "");
    entries[entryName] = file;
  });

  return entries;
}
