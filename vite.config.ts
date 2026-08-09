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
        {
          src: `${cesiumBuild}/Assets`,
          dest: "cesiumStatic",
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumBuild}/ThirdParty`,
          dest: "cesiumStatic",
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumBuild}/Widgets`,
          dest: "cesiumStatic",
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumBuild}/Workers`,
          dest: "cesiumStatic",
          rename: { stripBase: 4 },
        },
      ],
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
