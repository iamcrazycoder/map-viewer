import { Knex } from "knex";

const tableName = "locations";
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(tableName);

  if (!tableExists) {
    await knex.schema.createTable(tableName, (table) => {
      table.string("name").notNullable().primary();

      // geographical points
      table.geometry("boundingBox").notNullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(tableName);
}
