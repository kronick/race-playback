import { PositionsArray } from "../shared-types/race-data";

export const interpolatePosition = (
  time: number,
  positions: PositionsArray
): [number, number] | null => {
  if (positions.length === 0) {
    return null;
  }

  let i_left = 0;
  let i_right = positions.length - 1;
  while (i_left <= i_right) {
    let i_mid = Math.floor((i_left + i_right) / 2);
    let t_mid = positions[i_mid].timestamp;

    // Case where time matches midpoint exactly
    if (t_mid === time) {
      return positions[i_mid].coordinates;
    }
    // Case where midpoint is lower bound of interpolated range
    if (t_mid < time && positions[i_mid + 1]?.timestamp > time) {
      return interpolateCoords(time, positions[i_mid], positions[i_mid + 1]);
    }
    // Case where midpoint is upper bound of interpolated range
    if (t_mid > time && positions[i_mid - 1]?.timestamp < time) {
      return interpolateCoords(time, positions[i_mid - 1], positions[i_mid]);
    }

    if (t_mid < time) {
      i_left = i_mid + 1;
    } else if (t_mid > time) {
      i_right = i_mid - 1;
    }
  }
  return null;
};

const interpolateCoords = (
  t: number,
  a: { timestamp: number; coordinates: [number, number] },
  b: { timestamp: number; coordinates: [number, number] }
): [number, number] => {
  const span = b.timestamp - a.timestamp;
  const offset = t - a.timestamp;
  const blend = offset / span;
  return [
    (b.coordinates[0] - a.coordinates[0]) * blend + a.coordinates[0],
    (b.coordinates[1] - a.coordinates[1]) * blend + a.coordinates[1]
  ];
};
