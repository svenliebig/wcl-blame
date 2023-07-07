import { config } from "dotenv";
config({ path: "../.env/test" });

import { createClient } from "wcl-blame-api";

const client = createClient({
  token: process.env.WCL_TOKEN as string,
});

client.getRateLimit().then((data) => {
  console.log(data);
});
