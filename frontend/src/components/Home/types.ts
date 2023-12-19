export type TreePayload = {
  id: string;
  longitude: number;
  latitude: number;
  health: "Good" | "Fair" | "Poor" | null;
};

export type LocationInsight = {
  count: number;
  city: string;
  latitude: number;
  longitude: number;
  boundingBox: [number, number][];
};

export type Tree = {
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
};
