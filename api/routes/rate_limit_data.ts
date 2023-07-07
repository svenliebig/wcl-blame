import * as gql from "gql-query-builder";
import { RateLimitData } from "../gql/graphql";
import { WclCLient } from "../client";

export const rateLimitQuery = gql.query({
  operation: "rateLimitData",
  fields: ["limitPerHour", "pointsSpentThisHour", "pointsResetIn"],
});

export function initRateLimit(client: WclCLient) {
  return async () => {
    return await client.call<RateLimitData>(rateLimitQuery);
  };
}
