import { describe, expect, it, vitest } from "vitest";
import { getClient } from "../../../../client";
import { initPlayerDetails, playerDetailsQuery } from "../player_details";

const client = getClient(process.env.WCL_TOKEN as string);
const fakeClient = getClient("fake token");

describe("playerDetails", () => {
  it("should call everything correct", async () => {
    const spy = vitest.spyOn(fakeClient, "call");
    spy.mockReturnValueOnce({
      reportData: { report: { playerDetails: { data: { playerDetails: { asdf: 123 } } } } },
    } as never);

    const get = initPlayerDetails(fakeClient);
    const playerDetails = await get("asdf", {});

    expect(playerDetails).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(playerDetailsQuery("asdf", {}));
  });

  it("expect api to be called", async () => {
    const playerDetails = await initPlayerDetails(client)("wrq617zdyhGtT3An", {
      fightIDs: [12],
    });

    expect(playerDetails).toHaveProperty("dps");
    expect(playerDetails).toHaveProperty("healers");
    expect(playerDetails).toHaveProperty("tanks");
    expect(playerDetails.dps).toHaveLength(14);
  });
});
