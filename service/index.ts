import { config } from "dotenv";
config({ path: "../.env/test" });

import { EventDataType, HostilityType, PlayerDetails, ReportFight, createClient } from "wcl-blame-api";

const client = createClient({
	token: process.env.WCL_TOKEN as string,
});

export async function getEncounterFights(
	reportId: string
): Promise<Map<number, Array<Pick<ReportFight, "fightPercentage" | "id" | "friendlyPlayers">>>> {
	const fights = await client.getReportFights(reportId, ["id", "fightPercentage", "encounterID", "friendlyPlayers"]);

	const filtered = fights.filter((fight) => fight.encounterID !== 0);
	const fightIdByEncounter = new Map<number, Array<Omit<(typeof fights)[number], "encounterID">>>();

	filtered.forEach(({ encounterID, ...rest }) => {
		if (fightIdByEncounter.has(encounterID)) {
			fightIdByEncounter.get(encounterID)?.push(rest);
		} else {
			fightIdByEncounter.set(encounterID, [rest]);
		}
	});

	return fightIdByEncounter;
}

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

	const failersMap = new Map<
		number,
		{
			attended: number;
			hitByWave: number;
			player?: PlayerDetails;
		}
	>();
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
		console.log(`getting events for encounter ${encounterId} for ${fightIDs!.length} fights...`);
		const events = await client.getReportEvents("wrq617zdyhGtT3An", {
			fightIDs,
			dataType: EventDataType.DamageTaken,
			hostilityType: HostilityType.Friendlies,
			abilityID: 403543,
			wipeCutoff: 2,
		});

		console.log(`found ${events.length} events... processing...`);
		for (const { targetID } of events) {
			if (failersMap.has(targetID)) {
				failersMap.get(targetID)!.hitByWave++;
			} else {
				failersMap.set(targetID, { attended: 0, hitByWave: 1 });
			}
		}

		console.log(`done processing events for encounter ${encounterId}`);
	}

	const { dps, healers, tanks } = await client.getReportPlayerDetails("wrq617zdyhGtT3An", {
		fightIDs: filtered.map((fight) => fight.id),
	});

	for (const player of [dps, healers, tanks].flat()) {
		if (failersMap.has(player.id)) {
			failersMap.get(player.id)!.player = player;
		}
	}

	const failers = Array.from(failersMap.values());
	failers.sort((a, b) => b.hitByWave - a.hitByWave);

	console.log("\nFails:");
	failers.forEach((failer) => {
		console.log(`${failer.player} ran into ${failer.hitByWave} waves (during ${failer.attended} fights)`);
	});
})();
