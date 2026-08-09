export type PlateauDataset = Readonly<{
  cityCode: string;
  label: string;
  url: string;
  verifiedOn: string;
}>;

const DATASET_ROOT =
  "https://api.plateauview.mlit.go.jp/datacatalog/3dtiles";

export const TOKYO_BUILDINGS: PlateauDataset = {
  cityCode: "13101",
  label: "東京・千代田区 建築物モデル",
  url: `${DATASET_ROOT}/13101-bldg-maxlod2-latest/tileset.json`,
  verifiedOn: "2026-08-09",
};

export const KYOTO_BUILDINGS: PlateauDataset = {
  cityCode: "26100",
  label: "京都市 建築物モデル",
  url: `${DATASET_ROOT}/26100-bldg-maxlod2-latest/tileset.json`,
  verifiedOn: "2026-08-09",
};

export const PLATEAU_DATA_SOURCE_URL =
  "https://www.mlit.go.jp/plateau/open-data/";

export const PLATEAU_DELIVERY_DOCS_URL =
  "https://docs.plateauview.mlit.go.jp/datasets/3d-tiles/";
