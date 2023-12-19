import { StringToArrayOfStrings } from "../../utils/types";

export interface Tree {
  id: string;
  treeId: string;
  latitude: number;
  longitude: number;
  status: "Alive" | "Stump" | "Dead" | null;
  health: string | null;
  species: string;
  problems: string[] | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  state: string | null;
}

export type GetTreesFilterAttributes = StringToArrayOfStrings<
  Pick<Tree, "health" | "species" | "problems">
>;

export type ParsedFilterAttributes = {
  keys: string[];
  values: string[][];
};

export type CoOrdinates = {
  longitude: number;
  latiture: number;
};

// [[x-min, y-min], [x-max, y-max]]
export type BoundingBox = [[number, number], [number, number]];

export type InsightsPayload = {
  count: number;
  city: string;
  longitude: number;
  latitude: number;
  boundingBox: BoundingBox;
};

export type GeoJSON = {
  type: String;
  coordinates: [number, number][][];
};
