import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable("trees");

  if (!tableExists) {
    await knex.schema.createTable("trees", (table) => {
      // identifiers
      table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
      table.integer("treeId").unique().unsigned().notNullable();

      // geographical points
      table.geometry("geom").notNullable();

      // statuses
      table.enum("status", ["Alive", "Stump", "Dead"], {
        enumName: "enum_trees_statuses",
        useNative: true,
        schemaName: "public",
      });
      table.enum("health", ["Good", "Fair", "Poor"]);

      // specification
      table.string("species", 50);
      table.specificType("problems", "TEXT ARRAY");

      // address
      table.string("address", 100);
      table.string("zipcode", 10);
      table.string("city", 50);
      table.string("state", 50);

      table.index("health", "idx_trees_health");
      table.index("species", "idx_trees_species");
      table.index("problems", "idx_trees_problems", {
        indexType: "GIN",
      });
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // drop table; indexes will be dropped automatically
  // refer: https://www.postgresql.org/docs/current/sql-droptable.html#:~:text=DROP%20TABLE%20always%20removes%20any,table
  await knex.schema.dropTableIfExists("trees");

  // drop enum types
  await knex.raw("DROP TYPE public.enum_trees_statuses");
}
