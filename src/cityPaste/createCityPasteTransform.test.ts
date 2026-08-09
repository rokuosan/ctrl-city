import {
  Cartesian3,
  Matrix4,
  Transforms,
} from "cesium";
import { describe, expect, it } from "vitest";
import { createCityPasteTransform } from "./createCityPasteTransform";
import {
  KYOTO_STATION,
  TOKYO_STATION,
  stationToCartesian,
} from "./stations";

describe("createCityPasteTransform", () => {
  const source = stationToCartesian(KYOTO_STATION);
  const target = stationToCartesian(TOKYO_STATION);

  it("maps the source origin exactly to the target origin", () => {
    const transform = createCityPasteTransform(source, target);
    const result = Matrix4.multiplyByPoint(transform, source, new Cartesian3());

    expect(Cartesian3.distance(result, target)).toBeLessThan(0.001);
  });

  it("preserves local distances while changing the ENU frame", () => {
    const sourceFrame = Transforms.eastNorthUpToFixedFrame(source);
    const sourcePoint = Matrix4.multiplyByPoint(
      sourceFrame,
      new Cartesian3(100, 0, 25),
      new Cartesian3(),
    );
    const targetFrame = Transforms.eastNorthUpToFixedFrame(target);
    const expected = Matrix4.multiplyByPoint(
      targetFrame,
      new Cartesian3(100, 0, 25),
      new Cartesian3(),
    );
    const result = Matrix4.multiplyByPoint(
      createCityPasteTransform(source, target),
      sourcePoint,
      new Cartesian3(),
    );

    expect(Cartesian3.distance(result, expected)).toBeLessThan(0.001);
  });

  it("rotates local offsets around the target up axis", () => {
    const sourceFrame = Transforms.eastNorthUpToFixedFrame(source);
    const sourcePoint = Matrix4.multiplyByPoint(
      sourceFrame,
      new Cartesian3(100, 0, 0),
      new Cartesian3(),
    );
    const targetFrame = Transforms.eastNorthUpToFixedFrame(target);
    const expected = Matrix4.multiplyByPoint(
      targetFrame,
      new Cartesian3(0, 100, 0),
      new Cartesian3(),
    );
    const result = Matrix4.multiplyByPoint(
      createCityPasteTransform(source, target, 90),
      sourcePoint,
      new Cartesian3(),
    );

    expect(Cartesian3.distance(result, expected)).toBeLessThan(0.001);
  });
});
