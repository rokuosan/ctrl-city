import {
  Cartesian3,
  Math as CesiumMath,
  Matrix3,
  Matrix4,
  Transforms,
} from "cesium";

/**
 * Creates a rigid transform that maps source-local ENU coordinates into the
 * target-local ENU frame. A positive rotation turns counter-clockwise around
 * the local up axis when viewed from above.
 */
export function createCityPasteTransform(
  sourcePosition: Cartesian3,
  targetPosition: Cartesian3,
  rotationDeg = 0,
): Matrix4 {
  const sourceFrame = Transforms.eastNorthUpToFixedFrame(sourcePosition);
  const targetFrame = Transforms.eastNorthUpToFixedFrame(targetPosition);
  const inverseSource = Matrix4.inverseTransformation(
    sourceFrame,
    new Matrix4(),
  );
  const rotation = Matrix4.fromRotationTranslation(
    Matrix3.fromRotationZ(CesiumMath.toRadians(rotationDeg)),
  );
  const sourceToRotatedLocal = Matrix4.multiplyTransformation(
    rotation,
    inverseSource,
    new Matrix4(),
  );

  return Matrix4.multiplyTransformation(
    targetFrame,
    sourceToRotatedLocal,
    new Matrix4(),
  );
}
