import { config } from "dotenv";
config({ path: "../.env/test" });

import { EventDataType, HostilityType, PlayerDetails, ReportFight, createClient } from "wcl-blame-api";
import { Fail, getFailsForEncounter } from "./models/fails";

export * from "./utils/get_token_from_url";
export * from "./models/fails";

const client = createClient({
	token: process.env.WCL_TOKEN as string,
});

export async function getEncounterFights(reportId: string) {
	const fights = await client.getReportFights(reportId, [
		"id",
		"fightPercentage",
		"encounterID",
		"friendlyPlayers",
		"startTime",
	]);

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

export async function getEncounter(id: number) {
	return client.getEncounter(id);
}

export async function getPlayersForFights(reportId: string, fights: Array<Pick<ReportFight, "id">>) {
	const { dps, healers, tanks } = await client.getReportPlayerDetails(reportId, {
		fightIDs: fights.map((fight) => fight.id),
	});

	return [...dps, ...healers, ...tanks];
}

export async function evaluateFail(token: string, fail: Fail, fights: Array<Pick<ReportFight, "id">>) {
	const failers = new Map<
		number,
		{
			failed: number;
		}
	>();

	const events = await client.getReportEvents(token, {
		fightIDs: fights.map((fight) => fight.id),
		dataType: EventDataType.DamageTaken, // TODO: make this configurable
		hostilityType: HostilityType.Friendlies, // TODO: make this configurable (maybe)
		abilityID: fail.abilityID,
		limit: 50,
		wipeCutoff: 2, // TODO: make this configurable (do we want this?)
	});

	console.log(`Found ${events.length} events for ${fail.name}`);
	if (events.length === 300) {
		console.warn("Event limit reached, some data might be missing");
	}

	for (const { targetID } of events) {
		if (failers.has(targetID)) {
			failers.get(targetID)!.failed++;
		} else {
			failers.set(targetID, { failed: 1 });
		}
	}

	return failers;
}

export class Failers {
	private failers: Map<number, { attended: number; failed: number; player: PlayerDetails }> = new Map();

	constructor(players: PlayerDetails[]) {
		players.forEach((player) => {
			this.failers.set(player.id, { attended: 0, failed: 0, player });
		});
	}

	public addAttendence(fights: Pick<ReportFight, "id" | "friendlyPlayers">[]) {
		fights.forEach((fight) => {
			fight.friendlyPlayers?.forEach((playerId) => {
				if (!playerId) {
					return;
				}

				if (this.failers.has(playerId)) {
					this.failers.get(playerId)!.attended++;
				}
			});
		});
	}

	public addFails(fails: Map<number, { failed: number }>) {
		for (const [playerId, { failed }] of fails.entries()) {
			if (this.failers.has(playerId)) {
				this.failers.get(playerId)!.failed += failed;
			}
		}
	}

	public getFailers() {
		return this.failers;
	}
}

export async function getFails(token: string, opts?: { fightIDs?: number[]; encounterIDs?: number[] }) {
	if (!token) {
		throw new Error("No token provided");
	}

	const encounterFights = await getEncounterFights(token);
	const allFights = opts?.fightIDs ? opts.fightIDs.map((id) => ({ id })) : Array.from(encounterFights.values()).flat();

	if (encounterFights.size === 0) {
		return [];
	}

	const player = await getPlayersForFights(token, allFights);
	for (const [encounterID, fights] of encounterFights) {
		const fails = getFailsForEncounter(encounterID);

		if (fails.length === 0) {
			continue;
		}

		for (const fail of fails) {
			const failers = new Failers(player);
			const _fights = opts?.fightIDs ? fights.filter((fight) => opts.fightIDs?.includes(fight.id)) : fights;
			failers.addFails(await evaluateFail(token, fail, _fights));
			failers.addAttendence(_fights);

			const failArray = Array.from(failers.getFailers().values())
				.filter((data) => data.attended > 0)
				.map((data) => {
					let ratio = 0;

					if (data.attended > 0) {
						ratio = parseFloat((data.failed / data.attended).toFixed(2));
					}

					return { ...data, ratio };
				})
				.sort((a, b) => {
					if (a.ratio === b.ratio) {
						return b.player.name.localeCompare(a.player.name);
					}
					return b.ratio - a.ratio;
				});

			for (const data of failArray) {
				console.log(
					`${data.player.name} failed ${fail.name} ${data.failed} times in ${data.attended} fights (${data.ratio} times per fight)`
				);
			}
		}
	}
}

// (async () => {
// 	console.log("=== fight 3 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [3] }); // 10
// 	console.log("=== fight 4 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [4] }); // 3
// 	console.log("=== fight 5 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [5] }); // 6
// 	console.log("=== fight 6 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [6] }); // 7
// 	console.log("=== fight 7 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [7] }); // 3
// 	console.log("=== fight 8 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [8] }); // 5
// 	console.log("=== fight 9 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [9] }); // 0
// 	console.log("=== fight 10 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [10] }); // 6
// 	console.log("=== fight 11 ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [11] }); // 6

// 	console.log("=== all ===");
// 	// await getFails("a3fAPYtVNgcjmC4H", { fightIDs: [3, 4, 5, 6, 7, 8, 9, 10, 11] }); // 34
// 	await getFails("a3fAPYtVNgcjmC4H"); // 34
// })();
