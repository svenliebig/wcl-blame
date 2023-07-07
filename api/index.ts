import { getClient } from "./client";
import { initRateLimit } from "./routes/rate_limit_data";

type WclClientOptions = {
  token: string;
};

/**
 * creates a client for the Warcraft Logs API.
 */
export function createClient(o: WclClientOptions) {
  return {
    getRateLimit: initRateLimit(getClient(o.token)),
  };
}
