import { getClient } from "./client";
import { initRateLimit } from "./routes/rate_limit_data";
import { initFights } from "./routes/reportData/report";
import { initEncounter } from "./routes/worldData/encounter";

type WclClientOptions = {
  token: string;
};

/**
 * creates a client for the Warcraft Logs API.
 */
export function createClient(o: WclClientOptions) {
  const client = getClient(o.token);

  return {
    getRateLimit: initRateLimit(client),
    getReportFights: initFights(client),
    getEncounter: initEncounter(client),
  };
}
