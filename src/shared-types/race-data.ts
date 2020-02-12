import { GeoJSON } from "./geojson";
export type VesselData = {
  name: string;
  color?: string;
  /** GeoJSON representation of the vessel's overall historic path */
  path: GeoJSON.LineStringFeature;
  /** Path broken into smaller line segments, each with a `speed` property */
  pathWithSpeeds: GeoJSON.FeatureCollection;
  positions: PositionsArray;
};

export type PositionsArray = Array<{
  timestamp: number;
  coordinates: [number, number];
  heading: number;
  speed: number;
}>;

export type RaceData = {
  vessels: VesselData[];
  meta: {
    lengthInMinutes: number;
  };
};
