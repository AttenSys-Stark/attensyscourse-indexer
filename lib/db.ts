import * as schema from "./schema";
import { drizzle as nodePgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as pgLiteDrizzle } from "drizzle-orm/pglite";
import pg from "pg";

export function getDrizzlePgDatabase(connectionString: string) {
  // Create pglite instance
  //@todo note what to watch for in connectionString
  if (connectionString.includes("memory")) {
    return {
      db: pgLiteDrizzle({
        schema,
        connection: {
          dataDir: connectionString,
        },
      }),
    };
  }

  // Create node-postgres instance
  const pool = new pg.Pool({
    connectionString,
  });

  return { db: nodePgDrizzle(pool, { schema }) };
}