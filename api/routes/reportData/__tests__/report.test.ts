import { describe, expect, it, vitest } from "vitest";
import { fightsQuery, initFights } from "../report";
import { getClient } from "../../../client";

const client = getClient(process.env.WCL_TOKEN as string);
const fakeClient = getClient("fake token");

describe("fights", () => {
  it("should call everything correct", async () => {
    const spy = vitest.spyOn(fakeClient, "call");
    spy.mockReturnValueOnce({
      reportData: { report: { fights: { asdf: 123 } } },
    } as never);

    const fights = await initFights(fakeClient)("asdf");

    expect(fights[0]).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(fightsQuery("asdf", ["id", "fightPercentage", "encounterID"]));
  });

  it("expect api to be called", async () => {
    const fights = await initFights(client)("wrq617zdyhGtT3An", ["id"]);
    expect(fights).toHaveLength(26);
  });
});
