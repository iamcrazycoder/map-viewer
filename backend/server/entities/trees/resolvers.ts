import generateResolver, { type Context } from "../../utils/generateResolver";
import type {
  BoundingBox,
  GetTreesFilterAttributes,
  InsightsPayload,
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
  const parsedFilters = getParsedFilters(filters);
  let query = context.knex
    .select<Tree[] | null>([
      "id",
      context.knex.raw('ST_X(geom) AS "longitude"'),
      context.knex.raw('ST_Y(geom) AS "latitude"'),
      "health",
    ])
    .from("trees")
    .where(
      context.knex.raw(`
        geom @ ST_MakeEnvelope (
          ${boundingBox[0][0]}, ${boundingBox[0][1]},
          ${boundingBox[1][0]}, ${boundingBox[1][1]},
        4326)`)
    )
    .limit(500);

  for (const [index, column] of parsedFilters.keys.entries()) {
    if (column === "problems") {
      query = query
        .where(
          context.knex.raw(
            `array[${parsedFilters.values[index].map(
              (_) => "?"
            )}] <@ (problems)`,
            parsedFilters.values[index]
          )
        )
        .where(
          context.knex.raw(
            `array[${parsedFilters.values[index].map(
              (_) => "?"
            )}] @> (problems)`,
            parsedFilters.values[index]
          )
        );
    } else {
      query = query.whereIn(
        parsedFilters.keys[index],
        parsedFilters.values[index]
      );
    }
  }

  const trees = await query;

  return trees || [];
};

const getTreesInsights = async (
  filters: GetTreesFilterAttributes = {
    species: [],
    health: [],
    problems: [],
  },
  boundingBox: BoundingBox,
  context: Context
) => {
  const parsedFilters = getParsedFilters(filters);
  let query = context.knex
    .select<InsightsPayload[] | null>([
      context.knex.raw("count(trees.id)::integer"),
      "trees.city",
      context.knex.raw('ST_X(ST_CENTROID("boundingBox")) AS "longitude"'),
      context.knex.raw('ST_Y(ST_CENTROID("boundingBox")) AS "latitude"'),
      context.knex.raw(`
        array[
          array[ST_Xmin("boundingBox"), ST_Ymin("boundingBox")],
          array[st_xmax("boundingBox"), ST_Ymax("boundingBox")]
        ] as "boundingBox"
      `),
    ])
    .from("trees")
    .innerJoin("locations", "locations.name", "trees.city")
    .where(
      context.knex.raw(`
        geom @ ST_MakeEnvelope (
          ${boundingBox[0][0]}, ${boundingBox[0][1]},
          ${boundingBox[1][0]}, ${boundingBox[1][1]},
        4326)`)
    );

  for (const [index, column] of parsedFilters.keys.entries()) {
    if (column === "problems") {
      query = query
        .where(
          context.knex.raw(
            `array[${parsedFilters.values[index].map(
              (_) => "?"
            )}] <@ (problems)`,
            parsedFilters.values[index]
          )
        )
        .where(
          context.knex.raw(
            `array[${parsedFilters.values[index].map(
              (_) => "?"
            )}] @> (problems)`,
            parsedFilters.values[index]
          )
        );
    } else {
      query = query.whereIn(
        parsedFilters.keys[index],
        parsedFilters.values[index]
      );
    }
  }

  query.groupBy("trees.city", "locations.boundingBox");

  const insights = await query;

  return insights;
};

const getFilterOptions = async ({ context }: { context: Context }) => {
  const [healthOptions, problemOptions, speciesOptions] = await Promise.all([
    context.knex.distinct(context.knex.raw("health")).from("trees"),
    context.knex
      .distinct(context.knex.raw("unnest(problems) as problem"))
      .from("trees"),
    context.knex.distinct("species").from("trees"),
  ]);

  return {
    health: healthOptions.map((value) => value.health),
    problems: problemOptions.map((value) => value.problem),
    species: speciesOptions.map((value) => value.species),
  };
};

export default {
  Query: {
    getTree: generateResolver(({ args, context }) => getTree(args.id, context)),
    getTrees: generateResolver(({ args, context }) =>
      getTrees(args.filter, args.boundingBox, context)
    ),
    getTreesInsights: generateResolver(({ args, context }) =>
      getTreesInsights(args.filter, args.boundingBox, context)
    ),
    getFilterOptions: generateResolver(({ context }) =>
      getFilterOptions({ context })
    ),
  },
};
