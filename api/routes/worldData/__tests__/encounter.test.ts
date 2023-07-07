import { describe, expect, it, vitest } from "vitest";
import { encounterQuery, initEncounter } from "../encounter";
import { getClient } from "../../../client";

describe("encounter", () => {
  const client = getClient(process.env.WCL_TOKEN as string);
  const fakeClient = getClient("fake token");

  it("should call everything correct", async () => {
    const spy = vitest.spyOn(fakeClient, "call");
    spy.mockReturnValueOnce({
      worldData: { encounter: { asdf: 123 } },
    } as never);

    const encounter = await initEncounter(fakeClient)(2680);

    expect(encounter).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(encounterQuery(2680));
  });

  it("expect api to be called", async () => {
    const encounter = await initEncounter(client)(2680);

    expect(encounter).toEqual(
      expect.objectContaining({
        name: "Rashok, the Elder",
      })
    );
  });
});
