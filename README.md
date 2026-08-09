# Ctrl+CITY

Project PLATEAU の3D都市モデルを使い、京都駅周辺約500m四方を東京駅周辺へ「コピー＆ペースト」して重ねるWeb MVPです。

東京の建物はそのまま残し、京都の建物を半透明で表示します。建築・構造・法規上の移設可否を判定するシミュレーターではなく、都市スケール・建物密度・景観・空間構成の違いを体験するための比較ビューアです。

## 起動

Node.js 26 と pnpm 11 を使用しています。

```sh
pnpm install
pnpm dev
```

表示されたローカルURLをブラウザで開きます。PLATEAUの3D Tilesはブラウザから直接取得するため、初回表示にはネットワーク接続が必要です。

## 操作

- `COPY & PASTE`: `CTRL + C → CTRL + V` の演出後、京都の建物を東京へ重ねる
- `BEFORE / AFTER`: 東京のみ／東京と京都の合成を切り替える
- `ROTATION`: 京都の街区を東京駅のローカル上方向を軸に回転する
- `KYOTO OPACITY`: 京都側の透明度を10〜100%で変更する
- マウス／トラックパッド: CesiumJS標準の回転・移動・ズーム

## 技術構成

- Vite 8 + TypeScript
- CesiumJS 1.144
- Project PLATEAU 3D Tiles 配信サービス
- Cloudflare Workers Static Assets
- Vitest

主要モジュールは次のように分離しています。

```text
src/
├── app/
│   ├── initCesium.ts
│   └── cityPasteController.ts
├── cityPaste/
│   ├── createCityPasteTransform.ts
│   ├── clipping.ts
│   └── stations.ts
├── plateau/
│   ├── datasets.ts
│   └── loadTileset.ts
├── ui/
│   └── controls.ts
├── styles/
│   └── main.css
└── main.ts
```

CesiumJSのWorkers・Assets・Widgets・ThirdPartyは、ビルド時に`dist/cesiumStatic`へコピーされます。アプリ本体は`CESIUM_BASE_URL=/cesiumStatic`でこれらを参照します。

## 座標変換

京都駅と東京駅でそれぞれENU（East-North-Up）座標系を作り、京都側3D Tilesの元データを変更せず`Cesium3DTileset.modelMatrix`へ次の剛体変換を設定します。

```text
Transform = TokyoENU × RotationZ × inverse(KyotoENU)
```

これにより京都駅の原点は東京駅の原点へ一致し、建物の距離・高さ・姿勢を維持したままローカル上方向を軸に回転できます。この性質は自動テストで検証しています。

京都市の複合tilesetを読み込んだ後、京都駅を中心とした500m四方の外側を4枚の`ClippingPlane`で除外します。クリッピング平面は京都駅のENUフレームに置くため、`modelMatrix`による移動と回転にも追従します。

## PLATEAUデータ

2026-08-09時点で、公式データカタログAPIから次の複合tileset URLが200応答することを確認しています。`latest`は配信サービス側の最新年度へ追従します。

- 東京・千代田区: `https://api.plateauview.mlit.go.jp/datacatalog/3dtiles/13101-bldg-maxlod2-latest/tileset.json`
- 京都市: `https://api.plateauview.mlit.go.jp/datacatalog/3dtiles/26100-bldg-maxlod2-latest/tileset.json`

参照: [PLATEAU 3D Tiles配信仕様](https://docs.plateauview.mlit.go.jp/datasets/3d-tiles/)、[PLATEAUオープンデータ](https://www.mlit.go.jp/plateau/open-data/)

## 確認コマンド

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm types:worker:check
```

## Cloudflare Workers

`wrangler.jsonc`は、Viteの`dist`をWorkers Static Assetsとして配信する構成です。SPAフォールバック、現行の互換日付、`nodejs_compat`、ログ／トレース設定を含みます。バックエンドWorkerやCloudflare固有のデータバインディングは使用しません。

デプロイせず構成だけ検証する場合:

```sh
pnpm deploy:dry-run
```

Cloudflareへログイン済みの環境でデプロイする場合:

```sh
pnpm deploy
```

## MVP上の制約

- 京都市の複合tilesetを参照してブラウザ側でクリッピングするため、専用切り出しデータより通信・描画負荷が高くなる場合があります。
- LODの選択とタイル取得はCesiumJSへ委ねるため、回線速度やGPUによって詳細表示までの時間が変わります。
- 京都側の透明度は3D Tiles Stylingで適用します。元モデルの材質によって見え方に差が出る場合があります。
- iOS SafariのANGLE / Metalシェーダー互換性を優先し、Order Independent Translucencyは無効化しています。
- iOSではWebGL 1の互換描画を使い、大気表現と京都側の着色・半透明化を無効にしたうえで、3D TilesのLODとGPUキャッシュを制限しています。
- 地下構造、鉄道線形、衝突回避、法規判定、東京側建物の削除、任意都市選択は対象外です。
- スマートフォン向けの専用最適化は行っていません。
