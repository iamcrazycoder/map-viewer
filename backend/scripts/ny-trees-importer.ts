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
  using importer = new PostgresCSVImporter({
    filePath,
    temporaryTableName: "ul_temp_trees",
    primaryTableName: "trees",
    propertyMappings: [
      // ['temp-table', 'primary-table']
      ["tree_id", "id"],
      ["the_geom", "coords"],
      ["health", "health"],
      ["spc_common", "species"],
      ["problems", "problems"],
      ["address", "address"],
      ["zipcode", "zipcode"],
      ["zip_city", "city"],
      ["state", "state"],
    ],
  });

  await importer.init();
  await importer.import();
})();
