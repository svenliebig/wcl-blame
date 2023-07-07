export interface WclCLient {
  call<T>(query: any): Promise<T>;
}

export function getClient(token: string): WclCLient {
  return new Client(token);
}

class Client {
  constructor(private token: string) {}

  async call<T>(query: any): Promise<T> {
    const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
      method: "POST",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      throw new Error(
        `Could not call query: ${query} - ${res.status} ${res.statusText}`
      );
    }

    try {
      return await res.json();
    } catch (e) {
      throw new Error(`Could not parse response of query: ${query} ${e}`);
    }
  }
}
