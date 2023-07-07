import fetch from "node-fetch";
import { query } from "gql-query-builder";

export interface WclCLient {
  call<T>(qry: ReturnType<typeof query>): Promise<T>;
}

export function getClient(token: string): WclCLient {
  return new Client(token);
}

class Client implements WclCLient {
  constructor(private token: string) {}

  async call<T>(qry: ReturnType<typeof query>): Promise<T> {
    console.log("hello", qry.query);

    const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
      method: "POST",
      body: JSON.stringify(qry),
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
    });

    console.log("hello");

    if (!res.ok) {
      throw new Error(
        `Could not call query: ${qry} - ${res.status} ${res.statusText}`
      );
    }

    try {
      return ((await res.json()) as any).data as T;
    } catch (e) {
      throw new Error(`Could not parse response of query: ${qry} ${e}`);
    }
  }
}
