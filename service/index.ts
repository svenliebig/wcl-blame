import { config } from "dotenv";
config({ path: "../.env/test" });

import { createClient } from "wcl-blame-api";

const client = createClient({
  token: process.env.WCL_TOKEN as string,
});

const data = await client.getRateLimit();

console.log(data);
