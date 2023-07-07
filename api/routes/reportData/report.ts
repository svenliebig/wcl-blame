import * as gql from "gql-query-builder";
import { WclCLient } from "../../client";
import { ReportFight } from "../../gql/graphql";

const fightFields: Array<keyof ReportFight> = [
  "id",
  "fightPercentage",
  "encounterID",
];

export const fightsQuery = (code: string) =>
  gql.query({
    operation: "reportData",
    fields: [
      {
        operation: "report",
        fields: [
          {
            fights: fightFields,
          },
        ],
        variables: { code },
      },
    ],
  });

type FightResult = {
  reportData: {
    report: {
      fights: ReportFight[];
    };
  };
};

export function initFights(
  client: WclCLient
): (
  id: string
) => Promise<Array<Pick<ReportFight, (typeof fightFields)[number]>>> {
  return async (id: string) => {
    return (await client.call<FightResult>(fightsQuery(id))).reportData.report
      .fights;
  };
}
