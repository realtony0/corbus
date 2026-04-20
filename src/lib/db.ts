import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  client = neon(url);
  return client;
}

type SqlArgs = Parameters<NeonQueryFunction<false, false>>;

export const sql = ((...args: SqlArgs) =>
  getClient()(...args)) as NeonQueryFunction<false, false>;
