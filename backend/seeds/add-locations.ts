import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const tableName = "locations";
  // Deletes ALL existing entries
  await knex(tableName).del();

  const rawData = [
    {
      name: "Hollis",
      boundingBox: [
        ["-73.7770772", "40.7034361"],
        ["-73.7570772", "40.7234361"],
      ],
    },
    {
      name: "Ridgewood",
      boundingBox: [
        ["-73.9238621", "40.6917447"],
        ["-73.8902665", "40.7139459"],
      ],
    },
    {
      name: "Forest Hills",
      boundingBox: [
        ["-73.8585910", "40.7064024"],
        ["-73.8288667", "40.7386729"],
      ],
    },
    {
      name: "Oakland Gardens",
      boundingBox: [
        ["-73.7759660", "40.7439910"],
        ["-73.7559660", "40.7639910"],
      ],
    },
    {
      name: "Rosedale",
      boundingBox: [
        ["-73.7478004", "40.6492115"],
        ["-73.7249158", "40.6652966"],
      ],
    },
    {
      name: "Little Neck",
      boundingBox: [
        ["-73.7481874", "40.7520463"],
        ["-73.7281874", "40.7720463"],
      ],
    },
    {
      name: "Jamaica",
      boundingBox: [
        ["-73.8106429", "40.6929134"],
        ["-73.7906429", "40.7129134"],
      ],
    },
    {
      name: "Queens Village",
      boundingBox: [
        ["-73.7515208", "40.7167692"],
        ["-73.7315208", "40.7367692"],
      ],
    },
    {
      name: "Woodhaven",
      boundingBox: [
        ["-73.8679131", "40.6792698"],
        ["-73.8479131", "40.6992698"],
      ],
    },
    {
      name: "Howard Beach",
      boundingBox: [
        ["-73.8462459", "40.6478815"],
        ["-73.8262459", "40.6678815"],
      ],
    },
    {
      name: "Long Island City",
      boundingBox: [
        ["-73.9584995", "40.7355316"],
        ["-73.9384995", "40.7555316"],
      ],
    },
    {
      name: "Woodside",
      boundingBox: [
        ["-73.9154145", "40.7353798"],
        ["-73.8954145", "40.7553798"],
      ],
    },
    {
      name: "Glen Oaks",
      boundingBox: [
        ["-73.7215199", "40.7370463"],
        ["-73.7015199", "40.7570463"],
      ],
    },
    {
      name: "Richmond Hill",
      boundingBox: [
        ["-73.8409672", "40.6894253"],
        ["-73.8209672", "40.7094253"],
      ],
    },
    {
      name: "Corona",
      boundingBox: [
        ["-73.8701456", "40.7369593"],
        ["-73.8501456", "40.7569593"],
      ],
    },
    {
      name: "Saint Albans",
      boundingBox: [
        ["-73.7706881", "40.6884364"],
        ["-73.7506881", "40.7084364"],
      ],
    },
    {
      name: "New York",
      boundingBox: [
        ["-74.2588430", "40.4765780"],
        ["-73.7002330", "40.9176300"],
      ],
    },
    {
      name: "Brooklyn",
      boundingBox: [
        ["-74.0566880", "40.5503390"],
        ["-73.8329450", "40.7394340"],
      ],
    },
    {
      name: "Springfield Gardens",
      boundingBox: [
        ["-73.7565210", "40.6681590"],
        ["-73.7365210", "40.6881590"],
      ],
    },
    {
      name: "Village of Bellerose",
      boundingBox: [
        ["-73.7210790", "40.7215180"],
        ["-73.7121080", "40.7269730"],
      ],
    },
    {
      name: "Arverne",
      boundingBox: [
        ["-73.7995462", "40.5834173"],
        ["-73.7795462", "40.6034173"],
      ],
    },
    {
      name: "Far Rockaway",
      boundingBox: [
        ["-73.7651326", "40.5953825"],
        ["-73.7451326", "40.6153825"],
      ],
    },
    {
      name: "Staten Island",
      boundingBox: [
        ["-74.2588430", "40.4765780"],
        ["-74.0346130", "40.6515060"],
      ],
    },
    {
      name: "South Richmond Hill",
      boundingBox: [
        ["-73.8275258", "40.6892239"],
        ["-73.8271621", "40.6894619"],
      ],
    },
    {
      name: "Breezy Point",
      boundingBox: [
        ["-73.9311732", "40.5530214"],
        ["-73.9136522", "40.5593556"],
      ],
    },
    {
      name: "Sunnyside",
      boundingBox: [
        ["-73.9454153", "40.7298242"],
        ["-73.9254153", "40.7498242"],
      ],
    },
    {
      name: "College Point",
      boundingBox: [
        ["-73.8559682", "40.7776014"],
        ["-73.8359682", "40.7976014"],
      ],
    },
    {
      name: "South Ozone Park",
      boundingBox: [
        ["-73.8290231", "40.6601035"],
        ["-73.8090231", "40.6801035"],
      ],
    },
    {
      name: "Rockaway Park",
      boundingBox: [
        ["-73.8409796", "40.5771242"],
        ["-73.8291505", "40.5823244"],
      ],
    },
    {
      name: "Cambria Heights",
      boundingBox: [
        ["-73.7484653", "40.6845474"],
        ["-73.7284653", "40.7045474"],
      ],
    },
    {
      name: "Rego Park",
      boundingBox: [
        ["-73.8739144", "40.7107389"],
        ["-73.8516821", "40.7361008"],
      ],
    },
    {
      name: "Elmhurst",
      boundingBox: [
        ["-73.8883932", "40.7265804"],
        ["-73.8683932", "40.7465804"],
      ],
    },
    {
      name: "Village of New Hyde Park",
      boundingBox: [
        ["-73.6972170", "40.7233890"],
        ["-73.6752780", "40.7418080"],
      ],
    },
    {
      name: "Bayside",
      boundingBox: [
        ["-73.7870774", "40.7584351"],
        ["-73.7670774", "40.7784351"],
      ],
    },
    {
      name: "Kew Gardens",
      boundingBox: [
        ["-73.8407420", "40.7039415"],
        ["-73.8207420", "40.7239415"],
      ],
    },
    {
      name: "Whitestone",
      boundingBox: [
        ["-73.8284674", "40.7845457"],
        ["-73.8084674", "40.8045457"],
      ],
    },
    {
      name: "The Bronx",
      boundingBox: [
        ["-73.9339070", "40.7857390"],
        ["-73.7483740", "40.9176300"],
      ],
    },
    {
      name: "Jackson Heights",
      boundingBox: [
        ["-73.8957755", "40.7456561"],
        ["-73.8757755", "40.7656561"],
      ],
    },
    {
      name: "Astoria",
      boundingBox: [
        ["-73.9402673", "40.7620145"],
        ["-73.9202673", "40.7820145"],
      ],
    },
    {
      name: "Flushing",
      boundingBox: [
        ["-73.8274291", "40.7554301"],
        ["-73.8074291", "40.7754301"],
      ],
    },
    {
      name: "Fresh Meadows",
      boundingBox: [
        ["-73.8034668", "40.7248246"],
        ["-73.7834668", "40.7448246"],
      ],
    },
    {
      name: "Inwood",
      boundingBox: [
        ["-73.9324012", "40.8586468"],
        ["-73.9101872", "40.8777963"],
      ],
    },
    {
      name: "Central Park",
      boundingBox: [
        ["-78.8489412", "42.9339356"],
        ["-78.8289412", "42.9539356"],
      ],
    },
    {
      name: "East Elmhurst",
      boundingBox: [
        ["-73.8751358", "40.7512123"],
        ["-73.8551358", "40.7712123"],
      ],
    },
    {
      name: "Village of Floral Park",
      boundingBox: [
        ["-73.7227430", "40.7128570"],
        ["-73.6878830", "40.7374580"],
      ],
    },
    {
      name: "Middle Village",
      boundingBox: [
        ["-73.9048138", "40.7063405"],
        ["-73.8597733", "40.7304553"],
      ],
    },
    {
      name: "Ozone Park",
      boundingBox: [
        ["-73.8537461", "40.6667700"],
        ["-73.8337461", "40.6867700"],
      ],
    },
    {
      name: "Maspeth",
      boundingBox: [
        ["-73.9226370", "40.7131580"],
        ["-73.9026370", "40.7331580"],
      ],
    },
  ];
  const insertQueries = rawData.map((data) => {
    return {
      name: data.name,
      boundingBox: knex.raw(
        `ST_MakeEnvelope('${data.boundingBox[0][0]}', '${data.boundingBox[0][1]}', '${data.boundingBox[1][0]}', '${data.boundingBox[1][1]}')`
      ),
    };
  });

  // Inserts seed entries
  await knex(tableName).insert(insertQueries);
}
