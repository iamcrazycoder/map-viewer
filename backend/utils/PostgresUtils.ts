import knex, { Knex } from "knex";
import knexConfig from "../knexfile";

type PostgresUtilFnOptions<T> = {
  knexClient: Knex;
} & T;

type GenerateTemporaryTableOptions = PostgresUtilFnOptions<{
  tableName: string;
  columns: string[];
  truncateIfExists?: boolean;
}>;

export type ColumnMetadata = {
  enum?: Record<string, string>;
};

export default class PostgresUtils {
  static getKnexClient() {
    const knexClient = knex(knexConfig.development);
    return knexClient;
  }

  /**
   * Creates an unlogged table. Refer: https://www.crunchydata.com/blog/postgresl-unlogged-tables
   *
   * Unlogged tables are super light-weight because writes don't create WAL!
   * However, it's important to manage it and remove it if its not needed at the end of the process.
   *
   * This class will automatically drop the table after the class instance is GC'd
   *
   * @param columns table columnn names
   * @param tableName name of the table to create
   * @param truncateIfExists if the table exists, delete all rows | default: false
   * @returns Promise of db query
   */
  static async createTemporaryTable({
    knexClient,
    tableName,
    columns,
    truncateIfExists = false,
  }: GenerateTemporaryTableOptions) {
    const ddlQuery = `CREATE UNLOGGED TABLE IF NOT EXISTS ${tableName} (
          ${columns.join(",\n\t")}
      )`;

    await knexClient.raw(ddlQuery);

    if (truncateIfExists) {
      await knexClient.table(tableName).truncate();
    }
  }

  /**
   * fn to return cast expression
   *
   * @param type db-native type (char, integer, array, point)
   * @param columnName
   * @returns
   */
  static getCastExpression(
    type: string,
    columnName: string,
    metadata: ColumnMetadata
  ) {
    type = type.toLowerCase();

    if (["text", "char", "character varying", "integer"].includes(type)) {
      return `CAST("${columnName}" AS ${type})`;
    }

    if (type === "array") {
      return `string_to_array(${columnName}, ',')::text[]`;
    }

    if (type === "user-defined") {
      if (["geom", "the_geom", "coords"].includes(columnName)) {
      return `ST_PointFromText(${columnName})`;
      }

      if (metadata?.enum?.[columnName]) {
        return `${columnName}::${metadata?.enum?.[columnName]}`;
    }
    }

    return `${columnName}`;
  }
}
