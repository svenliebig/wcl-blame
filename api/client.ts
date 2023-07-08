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
    const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
      method: "POST",
      body: JSON.stringify(qry),
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Could not call query: ${qry} - ${res.status} ${res.statusText}`);
    }

    let data: any;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Could not parse response of query: ${qry} ${e}`);
    }

    if (data.errors) {
      console.error("errors", data.errors);
      throw new Error(`Could not call query: ${qry} - ${data.errors}`);
    }

    return data.data as T;
  }
}
