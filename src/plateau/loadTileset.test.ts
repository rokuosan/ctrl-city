import { describe, expect, it } from "vitest";
import { createPlateauTilesetOptions } from "./loadTileset";

describe("createPlateauTilesetOptions", () => {
  it("uses a bounded, lower-detail profile on iOS", () => {
    const options = createPlateauTilesetOptions(true);

    expect(options.cacheBytes).toBe(48 * 1024 * 1024);
    expect(options.maximumCacheOverflowBytes).toBe(16 * 1024 * 1024);
    expect(options.maximumScreenSpaceError).toBe(32);
    expect(options.preloadFlightDestinations).toBe(false);
    expect(options.preferLeaves).toBe(false);
    expect(options.skipLevelOfDetail).toBe(true);
  });

  it("keeps the detailed desktop profile", () => {
    const options = createPlateauTilesetOptions(false);

    expect(options.maximumScreenSpaceError).toBe(12);
    expect(options.preloadFlightDestinations).toBe(true);
    expect(options.preferLeaves).toBe(true);
  });
});
