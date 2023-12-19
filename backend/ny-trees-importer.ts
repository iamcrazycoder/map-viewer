import WebDownloader from "../modules/WebDownloader";
import PostgresCSVImporter from "../modules/PostgresCSVImporter";

(async () => {
  // initialize downloader to download remote file
  using downloader = new WebDownloader({
    url: "https://data.cityofnewyork.us/api/views/5rq2-4hqu/rows.csv?accessType=DOWNLOAD",
    outFile: "temp-file.csv",
  });
  const filePath = await downloader.download();

  // initialize CSV importer
  const csvHeaders = [
    "created_at",
    "tree_id",
    "block_id",
    "the_geom",
    "tree_dbh",
    "stump_diam",
    "curb_loc",
    "status",
    "health",
    "spc_latin",
    "spc_common",
    "steward",
    "guards",
    "sidewalk",
    "user_type",
    "problems",
    "root_stone",
    "root_grate",
    "root_other",
    "trnk_wire",
    "trnk_light",
    "trnk_other",
    "brnch_ligh",
    "brnch_shoe",
    "brnch_othe",
    "address",
    "zipcode",
    "zip_city",
    "cb_num",
    "borocode",
    "boroname",
    "cncldist",
    "st_assem",
    "st_senate",
    "nta",
    "nta_name",
    "boro_ct",
    "state",
    "Latitude",
    "longitude",
    "x_sp",
    "y_sp",
  ];
  const columnMappings: [string, string][] = [
    // temp-table => primary-table
    ["tree_id", "treeId"],
    ["the_geom", "geom"],
    ["health", "health"],
    ["status", "status"],
    ["spc_common", "species"],
    ["problems", "problems"],
    ["address", "address"],
    ["zipcode", "zipcode"],
    ["zip_city", "city"],
    ["state", "state"],
  ];

  const enumMapping: Record<string, string> = {
    status: "enum_trees_statuses",
  };
  using importer = new PostgresCSVImporter({
    filePath,
    csvHeaders,
    columnMappings,
    enumMapping,
    temporaryTable: {
      name: "ul_temp_trees",
      primaryKey: "tree_id",
    },
    primaryTable: {
      name: "trees",
      primaryKey: "id",
    },
  });

  // load dependencies
  await importer.init();

  // start importing from local file to postgres
  await importer.import();
})();
