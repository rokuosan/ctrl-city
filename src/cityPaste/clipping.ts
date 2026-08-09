import {
  Cartesian3,
  ClippingPlane,
  ClippingPlaneCollection,
  Color,
  Matrix4,
  Transforms,
} from "cesium";

export const DEFAULT_PASTE_SIZE_METERS = 500;
export const TARGET_CONTEXT_SIZE_METERS =
  Math.ceil((DEFAULT_PASTE_SIZE_METERS * Math.SQRT2) / 10) * 10;

/**
 * Keeps a square around a station and clips everything outside it.
 * `tilesetCenter` must be captured before applying the city-paste modelMatrix.
 */
export function createStationClippingPlanes(
  tilesetCenter: Cartesian3,
  stationPosition: Cartesian3,
  sizeMeters = DEFAULT_PASTE_SIZE_METERS,
): ClippingPlaneCollection {
  const halfSize = sizeMeters / 2;
  const clippingOrigin = Transforms.eastNorthUpToFixedFrame(tilesetCenter);
  const stationFrame = Transforms.eastNorthUpToFixedFrame(stationPosition);
  const inverseClippingOrigin = Matrix4.inverseTransformation(
    clippingOrigin,
    new Matrix4(),
  );
  const stationRelativeToTileset = Matrix4.multiplyTransformation(
    inverseClippingOrigin,
    stationFrame,
    new Matrix4(),
  );

  return new ClippingPlaneCollection({
    planes: [
      new ClippingPlane(Cartesian3.UNIT_X, halfSize),
      new ClippingPlane(Cartesian3.negate(Cartesian3.UNIT_X, new Cartesian3()), halfSize),
      new ClippingPlane(Cartesian3.UNIT_Y, halfSize),
      new ClippingPlane(Cartesian3.negate(Cartesian3.UNIT_Y, new Cartesian3()), halfSize),
    ],
    modelMatrix: stationRelativeToTileset,
    unionClippingRegions: true,
    edgeColor: Color.fromCssColorString("#74f8d0"),
    edgeWidth: 0.75,
  });
}
