import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const cesiumBuild = "node_modules/cesium/Build/Cesium";

export default defineConfig({
  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesiumStatic"),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: `${cesiumBuild}/Assets`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/ThirdParty`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/Widgets`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/Workers`, dest: "cesiumStatic" },
      ],
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
