function extractGeoJSONData(name: string, data: any[]) {
  const location = data.find((node) => {
    return [
      "place",
      "neighbourhood",
      "island",
      "administrative",
      "quarter",
      "residential",
    ].includes(node.type);
  });

  if (location) {
    console.log({
      name: location.name,
      boundingBox: [
        [location.boundingbox[2], location.boundingbox[0]],
        [location.boundingbox[3], location.boundingbox[1]],
      ],
    });
  } else {
    console.log("Not found for: ", name);
  }
}

async function main() {
  // TODO: retrieve via knex
  const locations = [
    "Hollis",
    "Ridgewood",
    "Forest Hills",
    "Oakland Gardens",
    "Rosedale",
    "Little Neck",
    "Jamaica",
    "Queens Village",
    "Woodhaven",
    "Howard Beach",
    "Long Island City",
    "Woodside",
    "Glen Oaks",
    "Richmond Hill",
    "Corona",
    "Saint Albans",
    "New York",
    "Brooklyn",
    "Springfield Gardens",
    "Bellerose",
    "Arverne",
    "Far Rockaway",
    "Staten Island",
    "South Richmond Hill",
    "Breezy Point",
    "Sunnyside",
    "College Point",
    "South Ozone Park",
    "Rockaway Park",
    "Cambria Heights",
    "Rego Park",
    "Elmhurst",
    "New Hyde Park",
    "Bayside",
    "Kew Gardens",
    "Whitestone",
    "Bronx",
    "Jackson Heights",
    "Astoria",
    "Flushing",
    "Fresh Meadows",
    "Inwood",
    "Central Park",
    "East Elmhurst",
    "Floral Park",
    "Middle Village",
    "Ozone Park",
    "Maspeth",
  ];

  for (const location of locations) {
    const url = `https://nominatim.openstreetmap.org/search.php?q=${encodeURI(
      `${location} New York`
    )}&polygon_geojson=1&format=json`;
    const data = await (await fetch(url)).json();

    extractGeoJSONData(location, data);
  }
}

main();
