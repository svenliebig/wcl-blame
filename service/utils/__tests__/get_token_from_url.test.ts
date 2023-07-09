import { describe, expect, it } from "vitest";
import { getTokenFromUrl } from "../get_token_from_url";

describe("getTokenFromUrl", () => {
	it("should not return any token from a random url", () => {
		const token = getTokenFromUrl("https://www.random.com/reports/2WRyZ3rj1GaHqFpw");
		expect(token).toBe(undefined);
	});

	it("should return the token from a default url", () => {
		const token = getTokenFromUrl("https://www.warcraftlogs.com/reports/2WRyZ3rj1GaHqFpw");
		expect(token).toBe("2WRyZ3rj1GaHqFpw");
	});

	it("should return the token from a url with ending #", () => {
		const token = getTokenFromUrl("https://www.warcraftlogs.com/reports/2WRyZ3rj1GaHqFpw#");
		expect(token).toBe("2WRyZ3rj1GaHqFpw");
	});

	it("should return the token from a url with ending # and fight selected", () => {
		const token = getTokenFromUrl("https://www.warcraftlogs.com/reports/2wryz3rj1gahqfpw#fight=28");
		expect(token).toBe("2wryz3rj1gahqfpw");
	});

	it("should return the token from a url with ending #, fight selected and type selected", () => {
		const token = getTokenFromUrl("https://www.warcraftlogs.com/reports/2wryz3rj1gahqfpw#fight=28&type=damage-taken");
		expect(token).toBe("2wryz3rj1gahqfpw");
	});

	it("should return the token from a url with ending #, fight selected and more complex sub selection", () => {
		const token = getTokenFromUrl(
			"https://www.warcraftlogs.com/reports/2wryz3rj1gahqfpw#fight=28&type=casts&source=7&ability=-23881"
		);
		expect(token).toBe("2wryz3rj1gahqfpw");
	});

	it("should return the token from a url with ending #, fight selected, more complex sub selection and a pin", () => {
		const token = getTokenFromUrl(
			"https://www.warcraftlogs.com/reports/2wryz3rj1gahqfpw#fight=28&type=casts&source=7&ability=-23881&pins=0%24Separate%24%23244F4B%24healing%24-1%24112560059.0.0.DeathKnight%24112560059.0.0.DeathKnight%24true%24167980139.0.0.Priest%24true%240%24111"
		);
		expect(token).toBe("2wryz3rj1gahqfpw");
	});
});
