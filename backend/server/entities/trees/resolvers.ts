import generateResolver, { type Context } from "../../utils/generateResolver";
import type {
  BoundingBox,
  GetTreesFilterAttributes,
  ParsedFilterAttributes,
  Tree,
} from "./types";

const getParsedFilters = (filters: GetTreesFilterAttributes) => {
  const parsedFilters: ParsedFilterAttributes = { keys: [], values: [] };
  for (let [key, value] of Object.entries(filters)) {
    if (value.length) {
      const values = value.map((v) => (!v || v === "" ? null : v));
      parsedFilters.keys.push(key);
      parsedFilters.values.push(values);
    }
  }

  return parsedFilters;
};

/**
 * Get a tree object by id from the database
 * @param id - the uuid id of the tree to retrieve
 * @returns the tree matching the given id, if available. Otherwise, null
 */
const getTree = async (id: string, context: Context): Promise<Tree | null> => {
  const data = await context.knex
    .select<Tree[] | null>([
      "*",
      context.knex.raw('ST_X(geom) AS "longitude"'),
      context.knex.raw('ST_Y(geom) AS "latitude"'),
    ])
    .from("trees")
    .where({ id });

  return data?.[0] || null;
};

const getTrees = async (
  filters: GetTreesFilterAttributes = {
    species: [],
    health: [],
    problems: [],
  },
  boundingBox: BoundingBox,
  context: Context
) => {
  const parsedFilters: ParsedFilterAttributes = { keys: [], values: [] };
  for (let [key, value] of Object.entries(filters)) {
    if (value.length) {
      parsedFilters.keys.push(key);
      parsedFilters.values.push(value);
    }
  }

  const trees = context.knex
    .select<Tree[] | null>([
      "id",
      context.knex.raw('ST_X(coords) AS "longitude"'),
      context.knex.raw('ST_Y(coords) AS "latitude"'),
    ])
    .from("trees")
    .whereIn(parsedFilters.keys, parsedFilters.values)
    .where(
      context.knex.raw(`
        coords @ ST_MakeEnvelope (
          ${boundingBox[0][0]}, ${boundingBox[0][1]},
          ${boundingBox[1][0]}, ${boundingBox[1][1]},
        4326)`)
    )
    .limit(1000);

  return trees;
};

export default {
  Query: {
    getTree: generateResolver(({ args, context }) => getTree(args.id, context)),
    getTrees: generateResolver(({ args, context }) =>
      getTrees(args.filter, args.boundingBox, context)
    ),
  },
};
