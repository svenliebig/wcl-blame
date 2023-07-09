import { getClient } from "./client";
import { initRateLimit } from "./routes/rate_limit_data";
import { initFights } from "./routes/reportData/report/fights";
import { initEvents } from "./routes/reportData/report/event";
import { initEncounter } from "./routes/worldData/encounter";
import { initPlayerDetails } from "./routes/reportData/report/player_details";

type WclClientOptions = {
	token: string;
};

export { EventDataType, HostilityType, ReportFight } from "./gql/graphql";
export { PlayerDetails } from "./routes/reportData/report/player_details";
export { Event } from "./routes/reportData/report/event";

/**
 * creates a client for the Warcraft Logs API.
 */
export function createClient(o: WclClientOptions) {
	const client = getClient(o.token);

	return {
		getRateLimit: initRateLimit(client),
		getReportFights: initFights(client),
		getEncounter: initEncounter(client),
		getReportEvents: initEvents(client),
		getReportPlayerDetails: initPlayerDetails(client),
	};
}
