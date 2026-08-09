import { Cesium3DTileset } from "cesium";
import { isIOSDevice } from "../app/platform";
import type { PlateauDataset } from "./datasets";

const MEBIBYTE = 1024 * 1024;

export class PlateauTilesetLoadError extends Error {
  readonly dataset: PlateauDataset;

  constructor(dataset: PlateauDataset, cause: unknown) {
    super(`${dataset.label}を読み込めませんでした。`, { cause });
    this.name = "PlateauTilesetLoadError";
    this.dataset = dataset;
  }
}

export async function loadPlateauTileset(
  dataset: PlateauDataset,
): Promise<Cesium3DTileset> {
  try {
    return await Cesium3DTileset.fromUrl(
      dataset.url,
      createPlateauTilesetOptions(),
    );
  } catch (error) {
    throw new PlateauTilesetLoadError(dataset, error);
  }
}

export function createPlateauTilesetOptions(ios = isIOSDevice()) {
  if (!ios) {
    return {
      maximumScreenSpaceError: 12,
      dynamicScreenSpaceError: true,
      preloadFlightDestinations: true,
      preferLeaves: true,
    };
  }

  // Keep iOS tile requests and GPU allocations below Safari's tighter limits.
  // ref: https://bugs.webkit.org/show_bug.cgi?id=318878
  // ref: https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html
  // ref: https://cesium.com/blog/2017/05/05/skipping-levels-of-detail/
  return {
    cacheBytes: 48 * MEBIBYTE,
    maximumCacheOverflowBytes: 16 * MEBIBYTE,
    maximumScreenSpaceError: 32,
    dynamicScreenSpaceError: true,
    foveatedMinimumScreenSpaceErrorRelaxation: 16,
    foveatedTimeDelay: 0.5,
    preloadFlightDestinations: false,
    preferLeaves: false,
    skipLevelOfDetail: true,
  };
}
