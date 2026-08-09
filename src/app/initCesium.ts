import {
  Color,
  EllipsoidTerrainProvider,
  Viewer,
} from "cesium";

export function initCesium(container: HTMLElement): Viewer {
  const viewer = new Viewer(container, {
    animation: false,
    baseLayer: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    terrainProvider: new EllipsoidTerrainProvider(),
    requestRenderMode: true,
  });

  viewer.scene.backgroundColor = Color.fromCssColorString("#07100f");
  viewer.scene.globe.baseColor = Color.fromCssColorString("#0c1a18");
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 40;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50_000;
  viewer.scene.fog.density = 0.00035;
  viewer.scene.fog.minimumBrightness = 0.02;
  viewer.clock.shouldAnimate = false;

  return viewer;
}
