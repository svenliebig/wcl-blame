import { config } from "dotenv";
config({ path: "../.env/test" });

import { createClient } from "wcl-blame-api";

const client = createClient({
  token: process.env.WCL_TOKEN as string,
});

// anonymous function because 2023
(async function () {
  const data = await client.getReportFights("wrq617zdyhGtT3An");
  console.log(`found ${data.length} fights, filtering out trash...`);

  const filtered = data.filter((fight) => fight.encounterID !== 0);
  console.log(`found ${filtered.length} fights, getting encounter data...`);

  const encounterIds = new Set<number>();
  filtered.forEach((fight) => encounterIds.add(fight.encounterID));

  const encounters = await Promise.all(
    Array.from(encounterIds).map((id) => client.getEncounter(id))
  );

  console.log(`found ${encounters.length} different encounters...`);
  encounters.forEach((encounter) => {
    console.log(`encounter ${encounter.id} (${encounter.name})`);
  });
})();
