import * as gql from "gql-query-builder";
import { WclCLient } from "../../../client";
import { ReportPlayerDetailsArgs } from "../../../gql/graphql";
import { createTransform } from "../../../utils/createTransform";

type PlayerDetails = {
  name: string;
  id: number;
  guid: number;
  type:
    | "Paladin"
    | "Shamen"
    | "Warrior"
    | "Hunter"
    | "Rogue"
    | "Priest"
    | "Death Knight"
    | "Mage"
    | "Warlock"
    | "Monk"
    | "Druid"
    | "Demon Hunter"
    | "Evoker";
  server: string;
  icon: string;
  specs: [
    {
      spec: string;
      count: number;
    }
  ];
  minItemLevel: number;
  maxItemLevel: number;
  potionUse: number;
  healthstoneUse: number;
  combatantInfo: Array<unknown>;
};

const transformVariables = createTransform({
  mapping: {
    killType: "KillType",
    hostilityType: "HostilityType",
    endTime: "Float",
    startTime: "Float",
  },
});

export const playerDetailsQuery = (code: string, variables: ReportPlayerDetailsArgs = {}) =>
  gql.query({
    operation: "reportData",
    fields: [
      {
        operation: "report",
        fields: [
          {
            operation: "playerDetails",
            fields: [],
            variables: transformVariables(variables),
          },
        ],
        variables: { code },
      },
    ],
  });

type PlayerDetailsResult = {
  reportData: {
    report: {
      playerDetails: {
        data: {
          playerDetails: {
            dps: Array<PlayerDetails>;
            healers: Array<PlayerDetails>;
            tanks: Array<PlayerDetails>;
          };
        };
      };
    };
  };
};

export function initPlayerDetails(client: WclCLient) {
  return async (code: string, variables: ReportPlayerDetailsArgs) => {
    const query = playerDetailsQuery(code, variables);
    return (await client.call<PlayerDetailsResult>(query)).reportData.report.playerDetails.data.playerDetails;
  };
}
