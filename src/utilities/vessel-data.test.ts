import { interpolatePosition } from "./vessel-data";
import { PositionsArray } from "../shared-types/race-data";

// Fixtures
const twoPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0] },
  { timestamp: 1, coordinates: [1, 1] }
];
const threePointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0] },
  { timestamp: 1, coordinates: [1, 4] },
  { timestamp: 2, coordinates: [2, 2] }
];

const fourPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0] },
  { timestamp: 1, coordinates: [1, 4] },
  { timestamp: 2, coordinates: [2, 2] },
  { timestamp: 3, coordinates: [3, 3] }
];
const manyPointsFixture = (): PositionsArray => [
  { timestamp: 0, coordinates: [0, 0] },
  { timestamp: 1, coordinates: [1, 100] },
  { timestamp: 2, coordinates: [2, 2] },
  { timestamp: 3, coordinates: [3, 3] },
  { timestamp: 4, coordinates: [4, 4] },
  { timestamp: 5, coordinates: [5, 5] },
  { timestamp: 6, coordinates: [6, 6] }
];

describe("Position interpolator", () => {
  it("works with two point paths", () => {
    expect(interpolatePosition(0, twoPointsFixture())).toEqual([0, 0]);
    expect(interpolatePosition(1, twoPointsFixture())).toEqual([1, 1]);

    expect(interpolatePosition(0.5, twoPointsFixture())?.[0]).toBeCloseTo(0.5);
    expect(interpolatePosition(0.5, twoPointsFixture())?.[1]).toBeCloseTo(0.5);
  });

  it("works with three point paths", () => {
    expect(interpolatePosition(0, threePointsFixture())).toEqual([0, 0]);
    expect(interpolatePosition(1, threePointsFixture())).toEqual([1, 4]);
    expect(interpolatePosition(2, threePointsFixture())).toEqual([2, 2]);

    expect(interpolatePosition(0.5, threePointsFixture())?.[0]).toBeCloseTo(
      0.5
    );
    expect(interpolatePosition(0.5, threePointsFixture())?.[1]).toBeCloseTo(2);

    expect(interpolatePosition(1.5, threePointsFixture())?.[0]).toBeCloseTo(
      1.5
    );
    expect(interpolatePosition(1.5, threePointsFixture())?.[1]).toBeCloseTo(3);
  });

  it("works with four point paths", () => {
    expect(interpolatePosition(0, fourPointsFixture())).toEqual([0, 0]);
    expect(interpolatePosition(1, fourPointsFixture())).toEqual([1, 4]);
    expect(interpolatePosition(2, fourPointsFixture())).toEqual([2, 2]);

    expect(interpolatePosition(0.5, fourPointsFixture())?.[0]).toBeCloseTo(0.5);
    expect(interpolatePosition(0.5, fourPointsFixture())?.[1]).toBeCloseTo(2);

    expect(interpolatePosition(2.5, fourPointsFixture())?.[0]).toBeCloseTo(2.5);
    expect(interpolatePosition(2.5, fourPointsFixture())?.[1]).toBeCloseTo(2.5);
  });

  it("works with many point paths", () => {
    expect(interpolatePosition(0, manyPointsFixture())).toEqual([0, 0]);
    expect(interpolatePosition(1, manyPointsFixture())).toEqual([1, 100]);
    expect(interpolatePosition(2, manyPointsFixture())).toEqual([2, 2]);

    expect(interpolatePosition(6, manyPointsFixture())).toEqual([6, 6]);
    expect(interpolatePosition(3, manyPointsFixture())).toEqual([3, 3]);

    expect(interpolatePosition(0.5, manyPointsFixture())?.[0]).toBeCloseTo(0.5);
    expect(interpolatePosition(0.5, manyPointsFixture())?.[1]).toBeCloseTo(50);

    expect(interpolatePosition(1.5, manyPointsFixture())?.[0]).toBeCloseTo(1.5);
    expect(interpolatePosition(1.5, manyPointsFixture())?.[1]).toBeCloseTo(51);
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
