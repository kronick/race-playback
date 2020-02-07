import { GeoJSON } from "./geojson";
export type VesselData = {
  name: string;
  color?: string;
  /** GeoJSON representation of the vessel's overall historic path */
  path: GeoJSON.LineStringFeature;
  positions: Array<{
    timestamp: number;
    coordinates: [number, number];
  }>;
};

export type RaceData = {
  vessels: VesselData[];
  meta: {
    lengthInSeconds: number;
  };
};
