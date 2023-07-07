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

    expect(fights).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(fightsQuery("asdf"));
  });

  it.only("expect api to be called", async () => {
    const fights = await initFights(client)("wrq617zdyhGtT3An");

    expect(fights).toHaveLength(26);
  });
});
