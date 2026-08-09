import { Cartesian3, Matrix4, Transforms } from "cesium";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PASTE_SIZE_METERS,
  createStationClippingPlanes,
} from "./clipping";
import { createCityPasteTransform } from "./createCityPasteTransform";
import {
  KYOTO_STATION,
  TOKYO_STATION,
  stationToCartesian,
} from "./stations";

describe("createStationClippingPlanes", () => {
  it("creates four unioned planes at half the selected square size", () => {
    const source = stationToCartesian(KYOTO_STATION);
    const tilesetCenter = Cartesian3.fromDegrees(135.5, 35.1);
    const collection = createStationClippingPlanes(tilesetCenter, source);

    expect(collection.length).toBe(4);
    expect(collection.unionClippingRegions).toBe(true);
    for (let index = 0; index < collection.length; index += 1) {
      expect(collection.get(index).distance).toBe(
        DEFAULT_PASTE_SIZE_METERS / 2,
      );
    }
  });

  it("positions the clipping box origin at the source station", () => {
    const source = stationToCartesian(KYOTO_STATION);
    const tilesetCenter = Cartesian3.fromDegrees(135.5, 35.1);
    const collection = createStationClippingPlanes(tilesetCenter, source);
    const clippingOrigin = Transforms.eastNorthUpToFixedFrame(tilesetCenter);
    const worldMatrix = Matrix4.multiplyTransformation(
      clippingOrigin,
      collection.modelMatrix,
      new Matrix4(),
    );
    const result = Matrix4.multiplyByPoint(
      worldMatrix,
      Cartesian3.ZERO,
      new Cartesian3(),
    );

    expect(Cartesian3.distance(result, source)).toBeLessThan(0.001);
  });

  it("moves the clipping box with the pasted city transform", () => {
    const source = stationToCartesian(KYOTO_STATION);
    const target = stationToCartesian(TOKYO_STATION);
    const tilesetCenter = Cartesian3.fromDegrees(135.5, 35.1);
    const collection = createStationClippingPlanes(tilesetCenter, source);
    const clippingOrigin = Transforms.eastNorthUpToFixedFrame(tilesetCenter);
    const sourceWorldMatrix = Matrix4.multiplyTransformation(
      clippingOrigin,
      collection.modelMatrix,
      new Matrix4(),
    );
    const pastedWorldMatrix = Matrix4.multiplyTransformation(
      createCityPasteTransform(source, target),
      sourceWorldMatrix,
      new Matrix4(),
    );
    const result = Matrix4.multiplyByPoint(
      pastedWorldMatrix,
      Cartesian3.ZERO,
      new Cartesian3(),
    );

    expect(Cartesian3.distance(result, target)).toBeLessThan(0.001);
  });
});
