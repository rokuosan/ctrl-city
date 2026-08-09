import "cesium/Build/Cesium/Widgets/widgets.css";
import "./styles/main.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <main class="boot-screen">
    <p class="boot-screen__eyebrow">PLATEAU CITY TRANSFER SYSTEM</p>
    <h1>Ctrl+CITY</h1>
    <p>都市データを準備しています。</p>
  </main>
`;
