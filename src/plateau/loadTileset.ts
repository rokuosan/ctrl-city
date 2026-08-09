import { Cesium3DTileset } from "cesium";
import type { PlateauDataset } from "./datasets";

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
    return await Cesium3DTileset.fromUrl(dataset.url, {
      maximumScreenSpaceError: 12,
      dynamicScreenSpaceError: true,
      preloadFlightDestinations: true,
      preferLeaves: true,
    });
  } catch (error) {
    throw new PlateauTilesetLoadError(dataset, error);
  }
}
