import {
  Color,
  EllipsoidTerrainProvider,
  Viewer,
} from "cesium";
import { isIOSDevice } from "./platform";

export function initCesium(container: HTMLElement): Viewer {
  const iosCompatibilityMode = isIOSDevice();
  const viewer = new Viewer(container, {
    animation: false,
    baseLayer: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    // Keep iOS away from WebGL2 shader variants that WebKit translates incorrectly.
    // ref: https://cesium.com/learn/cesiumjs/ref-doc/global.html
    // ref: https://chromium.googlesource.com/angle/angle/+/d33a22228ee2999ab5e2d2eda4d405c5768555d2/src/compiler/translator/TranslatorMetalDirect/ProgramPrelude.cpp
    contextOptions: {
      requestWebgl1: iosCompatibilityMode,
      webgl: {
        powerPreference: iosCompatibilityMode ? "low-power" : "high-performance",
      },
    },
    // Avoid Safari's ANGLE/Metal shader-linking regression for translucent 3D Tiles.
    // ref: https://bugs.webkit.org/show_bug.cgi?id=240919
    // ref: https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html
    orderIndependentTranslucency: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    terrainProvider: new EllipsoidTerrainProvider(),
    requestRenderMode: true,
  });

  viewer.scene.backgroundColor = Color.fromCssColorString("#07100f");
  viewer.scene.globe.baseColor = Color.fromCssColorString("#0c1a18");
  viewer.scene.globe.showGroundAtmosphere = !iosCompatibilityMode;
  viewer.scene.globe.enableLighting = !iosCompatibilityMode;
  viewer.scene.fog.enabled = !iosCompatibilityMode;
  viewer.scene.highDynamicRange = !iosCompatibilityMode;
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = !iosCompatibilityMode;
  }
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 40;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50_000;
  viewer.scene.fog.density = 0.00035;
  viewer.scene.fog.minimumBrightness = 0.02;
  viewer.clock.shouldAnimate = false;

  return viewer;
}
