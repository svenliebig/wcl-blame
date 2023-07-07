import gql from "gql-query-builder";
import { WclCLient } from "../../client";
import { Encounter, Query } from "../../gql/graphql";

export const encounterQuery = (id: number) =>
  gql.query({
    operation: "worldData",
    fields: [
      {
        operation: "encounter",
        fields: ["id", "name", "journalID"],
        variables: { id },
      },
    ],
  });

type Result = Required<Pick<Query, "worldData">>;

export function initEncounter(
  client: WclCLient
): (id: number) => Promise<Pick<Encounter, "id" | "journalID" | "name">> {
  return async (id: number) => {
    return (await client.call<Result>(encounterQuery(id))).worldData
      ?.encounter as never;
  };
}
