import { describe, expect, it, vitest } from "vitest";
import { getClient } from "../../../../client";
import { eventsQuery, initEvents } from "../event";
import { EventDataType, HostilityType } from "../../../../gql/graphql";

const client = getClient(process.env.WCL_TOKEN as string);
const fakeClient = getClient("fake token");

describe("events", () => {
  it("should call everything correct", async () => {
    const spy = vitest.spyOn(fakeClient, "call");
    spy.mockReturnValueOnce({
      reportData: { report: { events: { data: { asdf: 123 } } } },
    } as never);

    const get = initEvents(fakeClient);
    const fights = await get("asdf", {});

    expect(fights).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(eventsQuery("asdf", {}));
  });

  it("expect api to be called", async () => {
    const fights = await initEvents(client)("wrq617zdyhGtT3An", {
      fightIDs: [12],
      dataType: EventDataType.DamageTaken,
      hostilityType: HostilityType.Friendlies,
      abilityID: 403543,
      wipeCutoff: 2,
    });

    expect(fights).toHaveLength(46);
  });
});
