import { GeoJSON } from "./geojson";
export type VesselData = {
  name: string;
  color?: string;
  /** GeoJSON representation of the vessel's overall historic path */
  path: GeoJSON.LineStringFeature;
  positions: PositionsArray;
};

export type PositionsArray = Array<{
  timestamp: number;
  coordinates: [number, number];
}>;

export type RaceData = {
  vessels: VesselData[];
  meta: {
    lengthInSeconds: number;
  };
};
