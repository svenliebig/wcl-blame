declare module "node-fetch" {
  export default function fetch(
    url: string,
    options?: RequestInit
  ): Promise<Response>;
}
