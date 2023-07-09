import * as gql from "gql-query-builder";
import { WclCLient } from "../../../client";
import { ReportEventPaginator, ReportEventsArgs } from "../../../gql/graphql";
import VariableOptions from "gql-query-builder/build/VariableOptions";
import { createTransform } from "../../../utils/createTransform";

export type Event = {
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

const transformVariables = createTransform({
	mapping: {
		dataType: "EventDataType",
		hostilityType: "HostilityType",
		abilityID: "Float",
		startTime: "Float",
		endTime: "Float",
	},
});

export const eventsQuery = (code: string, variables: ReportEventsArgs = {}) =>
	gql.query({
		operation: "reportData",
		fields: [
			{
				operation: "report",
				fields: [
					{
						operation: "events",
						fields: ["data", "nextPageTimestamp"],
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
				nextPageTimestamp: number;
			};
		};
	};
};

export function initEvents(client: WclCLient) {
	return async (code: string, variables: ReportEventsArgs) => {
		return getEvents(client, code, variables);
	};
}

async function getEvents(client: WclCLient, code: string, variables: ReportEventsArgs): Promise<Array<Event>> {
	const query = eventsQuery(code, variables);
	const {
		reportData: {
			report: { events },
		},
	} = await client.call<EventResult>(query);

	if (events.nextPageTimestamp !== null) {
		return [
			...events.data,
			...(await getEvents(client, code, { ...variables, startTime: events.nextPageTimestamp, endTime: 999999999 })),
		];
	}

	return events.data;
}
