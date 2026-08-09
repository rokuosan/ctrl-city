import {
  BoundingSphere,
  Cesium3DTileColorBlendMode,
  Cesium3DTileStyle,
  Cesium3DTileset,
  HeadingPitchRange,
  Math as CesiumMath,
  Viewer,
} from "cesium";
import {
  DEFAULT_PASTE_SIZE_METERS,
  createStationClippingPlanes,
} from "../cityPaste/clipping";
import { createCityPasteTransform } from "../cityPaste/createCityPasteTransform";
import {
  KYOTO_STATION,
  TOKYO_STATION,
  stationToCartesian,
} from "../cityPaste/stations";
import { KYOTO_BUILDINGS, TOKYO_BUILDINGS } from "../plateau/datasets";
import { loadPlateauTileset } from "../plateau/loadTileset";

export type CityPasteState = Readonly<{
  enabled: boolean;
  opacity: number;
  rotationDeg: number;
  sizeMeters: number;
}>;

export type LoadProgress = Readonly<{
  loaded: number;
  message: string;
  total: number;
}>;

const DEFAULT_STATE: CityPasteState = {
  enabled: false,
  opacity: 0.5,
  rotationDeg: 0,
  sizeMeters: DEFAULT_PASTE_SIZE_METERS,
};

export class CityPasteController {
  readonly #viewer: Viewer;
  #tokyoTileset: Cesium3DTileset | undefined;
  #kyotoTileset: Cesium3DTileset | undefined;
  #state: CityPasteState = DEFAULT_STATE;

  constructor(viewer: Viewer) {
    this.#viewer = viewer;
  }

  get state(): CityPasteState {
    return this.#state;
  }

  get isReady(): boolean {
    return this.#tokyoTileset !== undefined && this.#kyotoTileset !== undefined;
  }

  async initialize(onProgress: (progress: LoadProgress) => void): Promise<void> {
    if (this.isReady) {
      return;
    }

    let loaded = 0;
    const load = async (label: string, task: Promise<Cesium3DTileset>) => {
      const tileset = await task;
      loaded += 1;
      onProgress({ loaded, total: 2, message: `${label}を接続しました` });
      return tileset;
    };

    onProgress({ loaded: 0, total: 2, message: "都市データへ接続中" });

    const [tokyoTileset, kyotoTileset] = await Promise.all([
      load("東京", loadPlateauTileset(TOKYO_BUILDINGS)),
      load("京都", loadPlateauTileset(KYOTO_BUILDINGS)),
    ]);

    this.#tokyoTileset = this.#viewer.scene.primitives.add(tokyoTileset);
    const kyoto = this.#viewer.scene.primitives.add(kyotoTileset);
    this.#kyotoTileset = kyoto;

    const sourcePosition = stationToCartesian(KYOTO_STATION);
    kyoto.clippingPlanes = createStationClippingPlanes(
      kyoto.boundingSphere.center,
      sourcePosition,
      this.#state.sizeMeters,
    );
    kyoto.colorBlendMode = Cesium3DTileColorBlendMode.MIX;
    kyoto.colorBlendAmount = 0.45;

    this.#applyTransform();
    this.#applyOpacity();
    kyoto.show = this.#state.enabled;
    this.#viewer.scene.requestRender();
  }

  setEnabled(enabled: boolean): void {
    this.#state = { ...this.#state, enabled };
    if (this.#kyotoTileset) {
      this.#kyotoTileset.show = enabled;
      this.#viewer.scene.requestRender();
    }
  }

  setRotation(rotationDeg: number): void {
    this.#state = {
      ...this.#state,
      rotationDeg: normalizeRotation(rotationDeg),
    };
    this.#applyTransform();
  }

  setOpacity(opacity: number): void {
    this.#state = {
      ...this.#state,
      opacity: Math.min(1, Math.max(0.1, opacity)),
    };
    this.#applyOpacity();
  }

  focusTokyo(duration = 0): void {
    const target = stationToCartesian(TOKYO_STATION);
    this.#viewer.camera.flyToBoundingSphere(
      new BoundingSphere(target, this.#state.sizeMeters / 2),
      {
        duration,
        offset: new HeadingPitchRange(
          CesiumMath.toRadians(18),
          CesiumMath.toRadians(-38),
          1_450,
        ),
      },
    );
  }

  destroy(): void {
    for (const tileset of [this.#tokyoTileset, this.#kyotoTileset]) {
      if (tileset && !tileset.isDestroyed()) {
        this.#viewer.scene.primitives.remove(tileset);
      }
    }
    this.#tokyoTileset = undefined;
    this.#kyotoTileset = undefined;
  }

  #applyTransform(): void {
    if (!this.#kyotoTileset) {
      return;
    }

    this.#kyotoTileset.modelMatrix = createCityPasteTransform(
      stationToCartesian(KYOTO_STATION),
      stationToCartesian(TOKYO_STATION),
      this.#state.rotationDeg,
    );
    this.#viewer.scene.requestRender();
  }

  #applyOpacity(): void {
    if (!this.#kyotoTileset) {
      return;
    }

    this.#kyotoTileset.style = new Cesium3DTileStyle({
      color: `color('#7bf6d1', ${this.#state.opacity})`,
    });
    this.#viewer.scene.requestRender();
  }
}

function normalizeRotation(rotationDeg: number): number {
  const normalized = ((rotationDeg + 180) % 360 + 360) % 360 - 180;
  return Object.is(normalized, -0) ? 0 : normalized;
}
