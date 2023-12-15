import { pipeline } from "node:stream/promises";
import fs, { PathLike, ReadStream } from "node:fs";
import fsPromise from "fs/promises";
import { from as copyFrom } from "pg-copy-streams";
import "../utils/polyfills";
import "dotenv/config";

import PostgresUtils from "../utils/PostgresUtils";
import { Knex } from "knex";

type TableConfig = {
  name: string;
  primaryKey: string;
};

type PostgresCSVImporterOptions = {
  filePath: PathLike;
  temporaryTable: TableConfig;
  primaryTable: TableConfig;
  columnMappings: [string, string][];
  csvHeaders: string[];
};

/**
 * Class to import data from CSV file to Postgres
 */
export default class PostgresCSVImporter implements Disposable {
  // table related config
  private temporaryTable: TableConfig;
  private primaryTable: TableConfig;
  private columnMappings: [string, string][]; // first tuple is the primary key pair

  // csv config
  private csvHeaders: string[];

  // file system related data
  private readonly filePath: PathLike;
  private readonly fileStream: ReadStream;

  // database client
  private knexClient: Knex;

  // local utils
  // flag to block execution until its resolved by loadedResolve()
  private readonly loaded: Promise<unknown>;

  // marks the loaded flag as true and unblocks all the executions
  // that were blocked by "await this.loaded"
  private loadedResolve!: (value: unknown | PromiseLike<unknown>) => void;

  constructor({
    filePath,
    temporaryTable,
    primaryTable,
    columnMappings,
    csvHeaders,
  }: PostgresCSVImporterOptions) {
    this.filePath = filePath;
    this.fileStream = fs.createReadStream(filePath);

    this.knexClient = PostgresUtils.getKnexClient();

    this.temporaryTable = temporaryTable;
    this.primaryTable = primaryTable;
    this.columnMappings = columnMappings;

    this.csvHeaders = csvHeaders;

    // setup deferred resolver
    this.loaded = new Promise((resolve) => {
      this.loadedResolve = resolve;
    });
  }

  /**
   * Fn to migrate selected data from temporary table to primary table
   * @returns
   */
  private async migrateFromTemporaryToPrimaryTable() {
    console.log("Now migrating data from temp table to primary table");
    const primaryTableColumns = this.columnMappings.map(
      (tuple) => `"${tuple[1]}"`
    );
    const castedExpressions = await this.castColumnsToPrimaryTableSchema();

    return this.knexClient.raw(`
        INSERT INTO ${this.primaryTable.name}
            (${primaryTableColumns.join(", ")})
        SELECT
            ${castedExpressions.join(",\n")}
        FROM ${this.temporaryTable.name}
        ON CONFLICT DO NOTHING
    `);
  }

  /**
   * Cast temp table string values to corresponsing types defined in the primary table schema
   */

  private async castColumnsToPrimaryTableSchema() {
    const primaryTableColumnSchema = await this.knexClient
      .table(this.primaryTable.name)
      .columnInfo();

    const castedExpressions = [];
    for (const [tempTableColumn, primaryTableColumn] of this.columnMappings) {
      const primaryTableColumnDefinition =
        primaryTableColumnSchema[primaryTableColumn];

      if (!primaryTableColumnDefinition) continue;

      const castedExpression = PostgresUtils.getCastExpression(
        primaryTableColumnDefinition.type,
        tempTableColumn
      );
      castedExpressions.push(castedExpression);
    }

    return castedExpressions;
  }

  /**
   * Prints to terminal the number of rows that were successfully imported from CSV to Postgres
   */
  private async printAnalytics() {
    const [{ count }] = await this.knexClient
      .table(this.temporaryTable.name)
      .count({ count: this.temporaryTable.primaryKey });

    console.log(
      `Successfully imported ${count} rows from CSV file to temp table`
    );
  }

  /**
   * Fn to setup the database connection and read the headers from CSV file
   *
   * IMPORTANT: After initializing this class, init() call should be the first call on the class instance
   */
  public async init() {
    const columnDefinitions = this.csvHeaders.map((column) => `${column} TEXT`);

    await PostgresUtils.createTemporaryTable({
      knexClient: this.knexClient,
      tableName: this.temporaryTable.name,
      columns: columnDefinitions,
    });

    console.log("Initialization successful! Starting import now..");

    // release the "loaded" lock for other fns to start processing
    // NOTE: very important to release the following lock or none of the public functions will work
    this.loadedResolve(true);
  }

  /**
   * Primary entry point to this class that faciliates the import of data from CSV to Postgres
   */
  public async import() {
    await this.loaded;

    const connection = this.knexClient.client.pool.acquireConnection();
    // create incoming database to ingest data from CSV file to Postgres
    const ingestStream = connection.query(
      copyFrom(
        `COPY ${this.temporaryTable.name} FROM STDIN DELIMITER ',' CSV HEADER`
      )
    );

    // pipe CSV file stream to database stream
    await pipeline(this.fileStream, ingestStream);

    // release pool connection
    await this.knexClient.client.pool.releaseConnection(connection);

    // print the outcome of the above process. Eg, no. of rows imported
    await this.printAnalytics();

    await this.migrateFromTemporaryToPrimaryTable();

    console.log("Process complete! 🎉");
  }

  // Cleanup after the class instance has finished processing
  async [Symbol.dispose]() {
    await Promise.all([
      // drop temporary unlogged table
      this.knexClient.schema.dropTableIfExists(this.temporaryTable.name),
      // delete CSV file from filesystem
      fsPromise.unlink(this.filePath),
    ]);

    // destroy readable file stream
    this.fileStream.destroy();

    // destroy database connection
    await this.knexClient.destroy();
  }
}
