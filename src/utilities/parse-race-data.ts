import { RaceData } from "../shared-types/race-data";
import { GeoJSON } from "../shared-types/geojson";

const parseRaceData = (input: string): RaceData => {
  const vesselPoints = input.split("^");

  let out = {
    vessels: vesselPoints.map((v, i) => {
      const coords = parseCoordinateString(v);

      const path: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: coords.filter(c => c !== null) as [number, number][]
        }
      };

      return {
        name: `Vessel ${i}`,
        path,
        positions: coords
          .map((c, i) => ({ timestamp: i, coordinates: c }))
          .filter(c => c.coordinates !== null) as {
          timestamp: number;
          coordinates: [number, number];
        }[]
      };
    })
  };

  return {
    ...out,
    meta: {
      lengthInSeconds: Math.max(
        ...out.vessels.map(v => v.positions[v.positions.length - 1].timestamp)
      )
    }
  };
};

const parseCoordinateString = (
  input: string
): Array<[number, number] | null> => {
  const parts = input.split("*");
  return parts.map(p =>
    p === "no_no"
      ? null
      : (p
          .split("_", 2)
          .map(n => Number(n))
          .reverse() as [number, number])
  );
};

export default parseRaceData;
