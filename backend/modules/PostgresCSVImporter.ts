import { pipeline } from "node:stream/promises";
import fs, { PathLike, ReadStream } from "node:fs";
import fsPromise from "fs/promises";
import pg from "pg";
import csv from "csv-parser";
import { from as copyFrom } from "pg-copy-streams";
import "../utils/polyfills";
import "dotenv/config";
type TableConfig = {
  name: string;
  primaryKey: string;
};

type PostgresCSVImporterOptions = {
  filePath: PathLike;
  temporaryTable: TableConfig;
  primaryTable: TableConfig;
  columnMappings: [string, string][];
};

/**
 * Class to import data from CSV file to Postgres
 */
export default class PostgresCSVImporter implements Disposable {
  // table related config
  private temporaryTable: TableConfig;
  private primaryTable: TableConfig;
  private columnMappings: [string, string][]; // first tuple is the primary key pair

  private readonly filePath: PathLike;
  private readonly fileStream: ReadStream;
  private readonly pool: pg.Pool;
  private client!: pg.PoolClient;
  private readonly loaded: Promise<unknown>;
  private loadedResolve!: (value: unknown | PromiseLike<unknown>) => void;

  constructor({
    filePath,
    temporaryTable,
    primaryTable,
    columnMappings,
  }: PostgresCSVImporterOptions) {
    this.pool = new pg.Pool({
      host: process.env.PG_HOST,
      port: +(process.env.PG_PORT || 5432),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

    this.filePath = filePath;
    this.fileStream = fs.createReadStream(filePath);

    this.temporaryTable = temporaryTable;
    this.primaryTable = primaryTable;
    this.columnMappings = columnMappings;

    // setup deferred resolver
    this.loaded = new Promise((resolve) => {
      this.loadedResolve = resolve;
    });
  }

  private async setupConnection() {
    this.client = await this.pool.connect();
  }

  /**
   * Reads CSV file in a separate stream and triggers temp table creation
   * as soon as the headers are detected. Please note that this fn will
   * release all the functions
   */
  private readFileHeaders() {
    const csvReader = fs.createReadStream(this.filePath).pipe(csv());

    // TODO: best way to read just the headers?
    csvReader.on("headers", async (headers) => {
      this.loadedResolve(true);

      await this.createTempTable(headers);

      // destroy stream
      csvReader.destroy();
    });
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
   * @returns Promise of db query
   */
  private async createTempTable(columns: string[] = []) {
    const columnDefinitions = columns.map((column) => `${column} TEXT`);
    const ddlQuery = `CREATE UNLOGGED TABLE IF NOT EXISTS ${
      this.temporaryTable.name
    } (
        ${columnDefinitions.join(",\n\t")}
    )`;

    return this.client.query(ddlQuery);
  }

  private async truncateTempTable() {
    const truncateTableQuery = `TRUNCATE TABLE ${this.temporaryTable.name}`;
    return this.client.query(truncateTableQuery);
  }

  /**
   * Drops temporary table that was created to accomodate all the raw data from CSV
   * @returns Promise of db query
   */
  private async dropTempTable() {
    return this.client.query(`DROP TABLE ${this.temporaryTable.name}`);
  }

  /**
   * Fn to migrate selected data from temporary table to primary table
   * @returns
   */
  private async migrateFromTempToPrimaryTable() {
    const tempTableColumns = this.propertyMappings.map((tuple) => tuple[0]);
    const primaryTableColumns = this.propertyMappings.map((tuple) => tuple[1]);

    return this.client.query(`
        INSERT INTO ${this.primaryTable.name}
            (${primaryTableColumns.join(", ")})
        SELECT
            ${tempTableColumns.join(", ")}
        FROM ${this.temporaryTableName}
        ON CONFLICT (id) DO NOTHING
    `);
  }

  /**
   * Prints to terminal the number of rows that were successfully imported from CSV to Postgres
   */
  private async printAnalytics() {
    const tempTablePrimaryKey = this.temporaryTable.primaryKey;
    const {
      rows: [{ count: rowCount }],
    } = await this.client.query(
      `SELECT COUNT(${tempTablePrimaryKey}) FROM ${this.temporaryTable.name}`
    );

    console.log(`Successfully imported ${rowCount} rows`);
  }

  /**
   * Fn to setup the database connection and read the headers from CSV file
   *
   * IMPORTANT: After initializing this class, init() call should be the first call on the class instance
   */
  public async init() {
    await this.setupConnection();
    this.readFileHeaders();
    await this.truncateTempTable();
  }

  /**
   * Primary entry point to this class that faciliates the import of data from CSV to Postgres
   */
  public async import() {
    await this.loaded;

    const ingestStream = this.client.query(
      copyFrom(
        `COPY ${this.temporaryTable.name} FROM STDIN DELIMITER ',' CSV HEADER`
      )
    );

    await pipeline(this.fileStream, ingestStream);
    await this.printAnalytics();

    await this.migrateFromTempToPrimaryTable();
  }

  // Cleanup after the class instance has finished processing
  async [Symbol.dispose]() {
    // drop temporary unlogged table
    // await this.dropTempTable();

    // destroy readable file stream
    this.fileStream.destroy();

    // release database client and close the pool
    this.client.release();
    await this.pool.end();

    // delete CSV file from filesystem
    await fsPromise.unlink(this.filePath);
  }
}
