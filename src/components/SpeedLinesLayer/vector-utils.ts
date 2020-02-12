// Vector helper functions
// -----------------------
export type Vec2 = [number, number];

/** Calculates a vector of unit length that is normal to the vector between points `a` and `b` */
export function unitNormal(a: Vec2, b: Vec2) {
  return unit([a[1] - b[1], b[0] - a[0]]);
}

/** Returns the cross product of vectors `a` and `b` */
export function crossProduct(a: Vec2, b: Vec2) {
  return a[0] * b[1] - a[1] * b[0];
}

/** Subtracts vector `a` from vector `b` and returns the result. */
export function subtract(a: Vec2, b: Vec2): Vec2 {
  return [b[0] - a[0], b[1] - a[1]];
}

export function unit(v: Vec2): Vec2 {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return [v[0] / length, v[1] / length];
}

/** Adds vector `a` to vector `b` and returns the result. */
export function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}
export function mult(v: Vec2, a: number): Vec2 {
  return [v[0] * a, v[1] * a];
}
/** Returns a vector equal in magnitude and of the opposite direction from
 *  vector `a`
 */
export function opposite(a: Vec2): Vec2 {
  return [-a[0], -a[1]];
}

/** Limits value `a` to fall between `low` and `high` */
export function clamp(a: number, low: number, high: number) {
  return Math.max(Math.min(a, high), low);
}
