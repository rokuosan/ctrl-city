import "cesium/Build/Cesium/Widgets/widgets.css";
import { CityPasteController } from "./app/cityPasteController";
import { initCesium } from "./app/initCesium";
import {
  PLATEAU_DATA_SOURCE_URL,
  PLATEAU_DELIVERY_DOCS_URL,
} from "./plateau/datasets";
import "./styles/main.css";
import { wireControls } from "./ui/controls";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <main class="app-shell" data-mode="before">
    <div id="cesium-container" class="city-view" aria-label="東京駅周辺の3D都市ビュー"></div>
    <div class="map-shade" aria-hidden="true"></div>

    <header class="topbar">
      <a class="brand" href="/" aria-label="Ctrl+CITY ホーム">
        <span class="brand__mark" aria-hidden="true">C+</span>
        <span>
          <strong>CTRL+CITY</strong>
          <small>URBAN TRANSFER LAB / 001</small>
        </span>
      </a>
      <div class="topbar__actions">
        <span class="edition">PLATEAU WEB MVP</span>
        <button id="about-button" class="text-button" type="button">ABOUT</button>
      </div>
    </header>

    <aside class="telemetry" aria-label="都市比較情報">
      <p class="kicker">LIVE COMPOSITE</p>
      <h1>街を、<br />別の街へ。</h1>
      <p class="telemetry__lead">京都駅500m圏の都市構造を、東京駅の座標へ重ねて比較する。</p>
      <dl class="telemetry__grid">
        <div><dt>SOURCE</dt><dd>35.0°N / 135.8°E</dd></div>
        <div><dt>TARGET</dt><dd>35.7°N / 139.8°E</dd></div>
        <div><dt>FRAME</dt><dd>LOCAL ENU → ECEF</dd></div>
        <div><dt>METHOD</dt><dd>MODEL MATRIX</dd></div>
      </dl>
    </aside>

    <div class="view-label" aria-live="polite">
      <span>VIEW</span>
      <strong class="view-label__before">TOKYO / ORIGINAL</strong>
      <strong class="view-label__after">TOKYO + KYOTO / COMPOSITE</strong>
    </div>

    <section class="control-deck" aria-label="コピー＆ペースト設定">
      <div class="route">
        <div class="station station--from">
          <span>FROM / COPY</span>
          <strong>京都駅</strong>
          <small>KYOTO STATION</small>
        </div>
        <div class="route__transfer" aria-hidden="true">
          <i></i><b>→</b><i></i>
        </div>
        <div class="station station--to">
          <span>TO / PASTE</span>
          <strong>東京駅</strong>
          <small>TOKYO STATION</small>
        </div>
      </div>

      <div class="mode-switch" aria-label="比較モード">
        <button id="mode-before" type="button" aria-pressed="true" disabled>
          <span>01</span> BEFORE
        </button>
        <button id="mode-after" type="button" aria-pressed="false" disabled>
          <span>02</span> AFTER
        </button>
      </div>

      <div class="settings">
        <div class="fixed-setting">
          <span class="setting-label">RANGE</span>
          <strong>500 × 500 <small>M</small></strong>
          <span class="range-mark" aria-hidden="true"></span>
        </div>
        <label class="slider-setting" for="rotation">
          <span class="setting-label">ROTATION</span>
          <output id="rotation-value" for="rotation">0°</output>
          <input id="rotation" type="range" min="-180" max="180" value="0" step="1" disabled />
          <span class="slider-scale"><i>−180</i><i>0</i><i>+180</i></span>
        </label>
        <label class="slider-setting" for="opacity">
          <span class="setting-label">KYOTO OPACITY</span>
          <output id="opacity-value" for="opacity">50%</output>
          <input id="opacity" type="range" min="10" max="100" value="50" step="1" disabled />
          <span class="slider-scale"><i>10</i><i>50</i><i>100</i></span>
        </label>
      </div>

      <button id="paste-button" class="paste-button" type="button" disabled>
        <span>COPY &amp; PASTE</span>
        <kbd>CTRL+C</kbd><b aria-hidden="true">→</b><kbd>CTRL+V</kbd>
      </button>
    </section>

    <div id="load-status" class="load-status" data-state="loading" role="status">
      <i aria-hidden="true"></i>
      <span id="load-status-text">都市データへ接続中</span>
      <button id="retry-button" type="button" hidden>再接続</button>
      <span id="load-progress" class="load-status__progress" aria-hidden="true"></span>
    </div>

    <footer class="attribution">
      <span>DATA</span>
      <a href="${PLATEAU_DATA_SOURCE_URL}" target="_blank" rel="noreferrer">Project PLATEAU / 国土交通省</a>
      <span>·</span>
      <a href="${PLATEAU_DELIVERY_DOCS_URL}" target="_blank" rel="noreferrer">3D Tiles 配信仕様</a>
    </footer>

    <div id="copy-sequence" class="copy-sequence" data-step="copy" role="status" aria-live="assertive" hidden>
      <div class="copy-sequence__scan" aria-hidden="true"></div>
      <div class="copy-sequence__card copy-sequence__copy">
        <small>01 / SELECT SOURCE</small><strong>CTRL + C</strong><span>KYOTO_500M.CITY</span>
      </div>
      <div class="copy-sequence__line" aria-hidden="true"><i></i></div>
      <div class="copy-sequence__card copy-sequence__paste">
        <small>02 / INSERT TARGET</small><strong>CTRL + V</strong><span>TOKYO_STATION.ECEF</span>
      </div>
      <p class="copy-sequence__prompt">COPY STORED — CTRL + V で東京へ貼り付け</p>
      <p class="copy-sequence__complete">PASTE COMPLETE</p>
    </div>

    <dialog id="about-dialog" class="about-dialog">
      <button id="about-close" class="about-dialog__close" type="button" aria-label="閉じる">×</button>
      <p class="kicker">ABOUT THE EXPERIMENT</p>
      <h2>街は、他の街に置いてみると個性が分かる。</h2>
      <p>Ctrl+CITYは、Project PLATEAUの実在都市データを使い、都市スケール・密度・景観の違いを直感的に体験する実験です。</p>
      <div class="about-dialog__notes">
        <p><span>COMPARE</span>東京の建物は残し、京都を半透明で重ねます。</p>
        <p><span>NOT A SIMULATION</span>建築・構造・法規上の移設可否は判定しません。</p>
        <p><span>OPEN DATA</span>建物モデルは国土交通省Project PLATEAUの3D Tilesを利用しています。</p>
      </div>
    </dialog>
  </main>
`;

const cesiumContainer = app.querySelector<HTMLElement>("#cesium-container");
if (!cesiumContainer) {
  throw new Error("Cesium container was not found.");
}

const viewer = initCesium(cesiumContainer);
const controller = new CityPasteController(viewer);
const controls = wireControls(app, {
  onModeChange: (mode) => controller.setEnabled(mode === "after"),
  onOpacityChange: (opacity) => controller.setOpacity(opacity),
  onRotationChange: (rotationDeg) => controller.setRotation(rotationDeg),
});

controller.focusTokyo();

async function start(): Promise<void> {
  try {
    await controller.initialize(({ loaded, message, total }) => {
      controls.setStatus(message, loaded / total);
    });
    controls.setReady();
    controller.focusTokyo(1.4);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "都市データを読み込めませんでした。";
    controls.setError(message);
    console.error("Ctrl+CITY initialization failed", error);
  }
}

void start();

window.addEventListener(
  "beforeunload",
  () => {
    controller.destroy();
    if (!viewer.isDestroyed()) {
      viewer.destroy();
    }
  },
  { once: true },
);
