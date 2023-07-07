import { describe, expect, it, vitest } from "vitest";
import { initRateLimit, rateLimitQuery } from "../rate_limit_data";
import { getClient } from "../../client";

// we are testing here, if we can actually write 4 lines of code without making a mistake
// nice.
// with 15 lines of code.
describe("getRateLimit", () => {
  const client = getClient("fake token");

  it("should return the rate limit data", async () => {
    const spy = vitest.spyOn(client, "call");
    spy.mockReturnValueOnce({ asdf: 123 } as never);

    const rateLimit = await initRateLimit(client)();

    expect(rateLimit).toEqual({
      asdf: 123,
    });

    expect(spy).toHaveBeenCalledWith(rateLimitQuery);
  });
});
