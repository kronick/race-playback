import { interpolatePosition } from "./vessel-data";
import { PositionsArray } from "../shared-types/race-data";

// Fixtures
const twoPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0], heading: 0, speed: 0 },
  { timestamp: 1, coordinates: [1, 1], heading: 1, speed: 0 }
];
const threePointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0], heading: 0, speed: 0 },
  { timestamp: 1, coordinates: [1, 4], heading: 1, speed: 0 },
  { timestamp: 2, coordinates: [2, 2], heading: 2, speed: 0 }
];

const fourPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0], heading: 0, speed: 0 },
  { timestamp: 1, coordinates: [1, 4], heading: 1, speed: 0 },
  { timestamp: 2, coordinates: [2, 2], heading: 2, speed: 0 },
  { timestamp: 3, coordinates: [3, 3], heading: 3, speed: 0 }
];
const manyPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0], heading: 0, speed: 0 },
  { timestamp: 1, coordinates: [1, 100], heading: 1, speed: 0 },
  { timestamp: 2, coordinates: [2, 2], heading: 2, speed: 0 },
  { timestamp: 3, coordinates: [3, 3], heading: 3, speed: 0 },
  { timestamp: 4, coordinates: [4, 4], heading: 4, speed: 0 },
  { timestamp: 5, coordinates: [5, 5], heading: 5, speed: 0 },
  { timestamp: 6, coordinates: [6, 6], heading: 6, speed: 0 }
];

describe("Position interpolator", () => {
  it("works with two point paths", () => {
    expect(interpolatePosition(0, twoPointsFixture())?.coordinates).toEqual([
      0,
      0
    ]);
    expect(interpolatePosition(1, twoPointsFixture())?.coordinates).toEqual([
      1,
      1
    ]);

    expect(
      interpolatePosition(0.5, twoPointsFixture())?.coordinates[0]
    ).toBeCloseTo(0.5);
    expect(
      interpolatePosition(0.5, twoPointsFixture())?.coordinates[1]
    ).toBeCloseTo(0.5);
  });

  it("works with three point paths", () => {
    expect(interpolatePosition(0, threePointsFixture())?.coordinates).toEqual([
      0,
      0
    ]);
    expect(interpolatePosition(1, threePointsFixture())?.coordinates).toEqual([
      1,
      4
    ]);
    expect(interpolatePosition(2, threePointsFixture())?.coordinates).toEqual([
      2,
      2
    ]);

    expect(
      interpolatePosition(0.5, threePointsFixture())?.coordinates[0]
    ).toBeCloseTo(0.5);
    expect(
      interpolatePosition(0.5, threePointsFixture())?.coordinates[1]
    ).toBeCloseTo(2);

    expect(
      interpolatePosition(1.5, threePointsFixture())?.coordinates[0]
    ).toBeCloseTo(1.5);
    expect(
      interpolatePosition(1.5, threePointsFixture())?.coordinates[1]
    ).toBeCloseTo(3);
  });

  it("works with four point paths", () => {
    expect(interpolatePosition(0, fourPointsFixture())?.coordinates).toEqual([
      0,
      0
    ]);
    expect(interpolatePosition(1, fourPointsFixture())?.coordinates).toEqual([
      1,
      4
    ]);
    expect(interpolatePosition(2, fourPointsFixture())?.coordinates).toEqual([
      2,
      2
    ]);

    expect(
      interpolatePosition(0.5, fourPointsFixture())?.coordinates[0]
    ).toBeCloseTo(0.5);
    expect(
      interpolatePosition(0.5, fourPointsFixture())?.coordinates[1]
    ).toBeCloseTo(2);

    expect(
      interpolatePosition(2.5, fourPointsFixture())?.coordinates[0]
    ).toBeCloseTo(2.5);
    expect(
      interpolatePosition(2.5, fourPointsFixture())?.coordinates[1]
    ).toBeCloseTo(2.5);
  });

  it("works with many point paths", () => {
    expect(interpolatePosition(0, manyPointsFixture())?.coordinates).toEqual([
      0,
      0
    ]);
    expect(interpolatePosition(1, manyPointsFixture())?.coordinates).toEqual([
      1,
      100
    ]);
    expect(interpolatePosition(2, manyPointsFixture())?.coordinates).toEqual([
      2,
      2
    ]);

    expect(interpolatePosition(6, manyPointsFixture())?.coordinates).toEqual([
      6,
      6
    ]);
    expect(interpolatePosition(3, manyPointsFixture())?.coordinates).toEqual([
      3,
      3
    ]);

    expect(
      interpolatePosition(0.5, manyPointsFixture())?.coordinates[0]
    ).toBeCloseTo(0.5);
    expect(
      interpolatePosition(0.5, manyPointsFixture())?.coordinates[1]
    ).toBeCloseTo(50);

    expect(
      interpolatePosition(1.5, manyPointsFixture())?.coordinates[0]
    ).toBeCloseTo(1.5);
    expect(
      interpolatePosition(1.5, manyPointsFixture())?.coordinates[1]
    ).toBeCloseTo(51);
  });

  it("returns null for out-of-bounds times", () => {
    expect(interpolatePosition(-1, twoPointsFixture())).toBe(null);
    expect(interpolatePosition(10, twoPointsFixture())).toBe(null);

    expect(interpolatePosition(-1, threePointsFixture())).toBe(null);
    expect(interpolatePosition(10, threePointsFixture())).toBe(null);
  });

  it("returns null for empty array", () => {
    expect(interpolatePosition(0, [])).toBe(null);
    expect(interpolatePosition(1, [])).toBe(null);
    expect(interpolatePosition(100, [])).toBe(null);
    expect(interpolatePosition(-10, [])).toBe(null);
  });
});
