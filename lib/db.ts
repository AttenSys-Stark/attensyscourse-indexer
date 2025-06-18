import * as schema from "./schema.js";
import { drizzle as nodePgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as pgLiteDrizzle } from "drizzle-orm/pglite";
import { Pool } from "pg";

export function getDrizzlePgDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Parse the connection string
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = url.port;
  const database = url.pathname.slice(1);
  const user = url.username;
  const password = url.password;

  // Create a new pool with SSL configuration
  const pool = new Pool({
    host,
    port: parseInt(port),
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  return nodePgDrizzle(pool, { schema });
}

export function getDrizzlePgLiteDatabase() {
  return pgLiteDrizzle({ schema });
}
