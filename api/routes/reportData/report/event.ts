import * as gql from "gql-query-builder";
import { WclCLient } from "../../../client";
import { ReportEventPaginator, ReportEventsArgs } from "../../../gql/graphql";
import VariableOptions from "gql-query-builder/build/VariableOptions";

type Event = {
  timestamp: number;
  type: "damage"; // do more later
  sourceID: number;
  targetID: number;
  abilityGameID: number;
  /** the fight id */
  fight: number;
  buffs: "145629.406139.97463."; // I don't know what this shit is
  hitType: 1; // basically number
  amount: 230466; // i guess the damage
  mitigated: number;
  /** big dam 😁 */
  unmitigatedAmount: number;
  /** who healed dis */
  absorbed: number;
  tick: true; // i don't know what this means
};

function transformVariables(vars: Record<string, unknown>): Record<string, VariableOptions> {
  const res: Record<string, VariableOptions> = {};

  for (const key in vars) {
    const val = vars[key];

    if (key === "dataType") {
      res[key] = {
        value: val,
        type: "EventDataType",
      };

      continue;
    }

    if (key === "hostilityType") {
      res[key] = {
        value: val,
        type: "HostilityType",
      };

      continue;
    }

    if (key === "abilityID") {
      res[key] = {
        value: val,
        type: "Float",
      };

      continue;
    }

    if (Array.isArray(val)) {
      if (val.length > 0) {
        if (typeof val[0] === "number") {
          res[key] = {
            value: val,
            list: true,
            type: "Int",
          };

          continue;
        }
      }
    }

    if (typeof val === "string") {
      res[key] = {
        value: val,
        type: "String",
      };
    }

    if (typeof val === "number") {
      res[key] = {
        value: val,
        type: "Int",
      };
    }
  }

  return res;
}

export const eventsQuery = (code: string, variables: ReportEventsArgs = {}) =>
  gql.query({
    operation: "reportData",
    fields: [
      {
        operation: "report",
        fields: [
          {
            operation: "events",
            fields: ["data"],
            variables: transformVariables(variables),
          },
        ],
        variables: { code },
      },
    ],
  });

type EventResult = {
  reportData: {
    report: {
      events: {
        data: Array<Event>;
      };
    };
  };
};

export function initEvents(client: WclCLient) {
  return async (code: string, variables: ReportEventsArgs) => {
    const query = eventsQuery(code, variables);
    return (await client.call<EventResult>(query)).reportData.report.events.data;
  };
}
