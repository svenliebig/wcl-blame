import { config } from "dotenv";
config({ path: "../.env/test" });

import { createClient } from "wcl-blame-api";
import { EventDataType, HostilityType } from "wcl-blame-api/gql/graphql";

const client = createClient({
  token: process.env.WCL_TOKEN as string,
});

// anonymous function because 2023
(async function () {
  const data = await client.getReportFights("wrq617zdyhGtT3An", [
    "id",
    "fightPercentage",
    "encounterID",
    "friendlyPlayers",
  ]);
  console.log(`found ${data.length} fights, filtering out trash...`);

  const filtered = data.filter((fight) => fight.encounterID !== 0);
  console.log(`found ${filtered.length} fights, getting encounter data...`);

  const failersMap = new Map<number, { attended: number; hitByWave: number }>();
  const fightIdByEncounter = new Map<number, Array<number>>();

  filtered.forEach(({ id, encounterID, friendlyPlayers }) => {
    friendlyPlayers?.forEach((playerId) => {
      if (typeof playerId !== "number") {
        return;
      }

      if (failersMap.has(playerId)) {
        failersMap.get(playerId)!.attended++;
      } else {
        failersMap.set(playerId, { attended: 1, hitByWave: 0 });
      }
    });

    if (fightIdByEncounter.has(encounterID)) {
      fightIdByEncounter.get(encounterID)?.push(id);
    } else {
      fightIdByEncounter.set(encounterID, [id]);
    }
  });

  const encounters = await Promise.all(Array.from(fightIdByEncounter.keys()).map((id) => client.getEncounter(id)));

  console.log(`found ${encounters.length} different encounters...`);
  encounters.forEach((encounter) => {
    console.log(`encounter ${encounter.id} (${encounter.name})`);
  });

  for (const encounterId of fightIdByEncounter.keys()) {
    const fightIDs = fightIdByEncounter.get(encounterId);
    const events = await client.getReportEvents("wrq617zdyhGtT3An", {
      fightIDs,
      dataType: EventDataType.DamageTaken,
      hostilityType: HostilityType.Friendlies,
      abilityID: 403543,
      wipeCutoff: 2,
    });

    for (const { targetID } of events) {
      if (failersMap.has(targetID)) {
        failersMap.get(targetID)!.hitByWave++;
      } else {
        failersMap.set(targetID, { attended: 0, hitByWave: 1 });
      }
    }
  }

  console.log(failersMap);
})();
