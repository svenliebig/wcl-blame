import * as gql from "gql-query-builder";
import { WclCLient } from "../../../client";
import { ReportFight } from "../../../gql/graphql";

export const fightsQuery = (code: string, fields: Array<keyof ReportFight>) =>
  gql.query({
    operation: "reportData",
    fields: [
      {
        operation: "report",
        fields: [
          {
            fights: fields,
          },
        ],
        variables: { code },
      },
    ],
  });

type FightResult<T extends keyof ReportFight> = {
  reportData: {
    report: {
      fights: Array<Pick<ReportFight, T>>;
    };
  };
};

const fightsFields = ["id", "fightPercentage", "encounterID"] satisfies Array<keyof ReportFight>;

export function initFights(client: WclCLient) {
  return async <T extends keyof ReportFight = (typeof fightsFields)[number]>(
    id: string,
    fields: Array<T> = fightsFields as Array<T>
  ) => {
    const query = fightsQuery(id, fields);
    return (await client.call<FightResult<T>>(query)).reportData.report.fights;
  };
}
