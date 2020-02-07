export namespace GeoJSON {
  export type Feature<
    T extends
      | Point
      | MultiPoint
      | LineString
      | MultiLineString
      | Polygon
      | MultiPolygon
      | GeometryCollection
  > = {
    type: "Feature";
    geometry: T;
    properties: Record<string, AnyJSON>;
  } & GeoJSONObjectBase;

  type JSONObject = { [key: string]: AnyJSON };
  interface JSONArray extends Array<AnyJSON> {}
  type AnyJSON = null | string | number | boolean | JSONArray | JSONObject;

  type ForeignMembers = Record<string, AnyJSON>;
  type Bbox = {
    bbox?:
      | [number, number, number, number]
      | [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number
        ];
  };

  type GeoJSONObjectBase = ForeignMembers & Bbox;

  // Typescript ftw! Check out that spread operator. Positions must have
  // a minimum of 2 values, with no maximum length
  // type Position = [number, number, ...number[]];
  // type LineStringCoordinateArray = [Position, Position, ...Position[]];
  // type LinearRing = [Position, Position, Position, Position, ...Position[]];

  type Position = number[];
  type LineStringCoordinateArray = Position[];
  type LinearRing = Position[];

  export type Point = {
    type: "Point";
    coordinates: Position;
  } & GeoJSONObjectBase;
  export type PointFeature = Feature<Point>;

  export type MultiPoint = {
    type: "MultiPoint";
    coordinates: Position[];
  } & GeoJSONObjectBase;
  export type MultiPointFeature = Feature<MultiPoint>;

  export type LineString = {
    type: "LineString";
    coordinates: LineStringCoordinateArray;
  } & GeoJSONObjectBase;
  export type LineStringFeature = Feature<LineString>;

  export type MultiLineString = {
    type: "MultiLineString";
    coordinates: LineStringCoordinateArray[];
  } & GeoJSONObjectBase;
  export type MultiLineStringFeature = Feature<MultiLineString>;

  export type Polygon = {
    type: "Polygon";
    coordinates: LinearRing[];
  } & GeoJSONObjectBase;
  export type PolygonFeature = Feature<Polygon>;

  export type MultiPolygon = {
    type: "MultiPolygon";
    coordinates: LinearRing[][];
  } & GeoJSONObjectBase;
  export type MultiPolygonFeature = Feature<MultiPolygon>;

  export type GeometryCollection = {
    type: "GeometryCollection";
    geometries: Array<
      Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon
    >;
  } & GeoJSONObjectBase;
  export type GeometryCollectionFeature = Feature<GeometryCollection>;

  export type FeatureCollection = {
    type: "FeatureCollection";
    features: Feature<
      | Point
      | MultiPoint
      | LineString
      | MultiLineString
      | Polygon
      | MultiPolygon
      | GeometryCollection
    >[];
  } & GeoJSONObjectBase;
}
