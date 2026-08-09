import { Cartesian3 } from "cesium";

export type Station = Readonly<{
  id: "kyoto" | "tokyo";
  nameJa: string;
  nameEn: string;
  cityJa: string;
  longitude: number;
  latitude: number;
  height: number;
}>;

export const KYOTO_STATION: Station = {
  id: "kyoto",
  nameJa: "京都駅",
  nameEn: "KYOTO STATION",
  cityJa: "京都",
  longitude: 135.7587667,
  latitude: 34.985849,
  height: 0,
};

export const TOKYO_STATION: Station = {
  id: "tokyo",
  nameJa: "東京駅",
  nameEn: "TOKYO STATION",
  cityJa: "東京",
  longitude: 139.767125,
  latitude: 35.681236,
  height: 0,
};

export function stationToCartesian(station: Station): Cartesian3 {
  return Cartesian3.fromDegrees(
    station.longitude,
    station.latitude,
    station.height,
  );
}
