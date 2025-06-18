import * as schema from "./schema.js";
import { drizzle as nodePgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as pgLiteDrizzle } from "drizzle-orm/pglite";
import pg from "pg";

export function getDrizzlePgDatabase(connectionString: string) {
  // Create pglite instance
  if (connectionString.includes("memory")) {
    return {
      db: pgLiteDrizzle({
        schema: {
          courseCreated: schema.courseCreated,
          courseReplaced: schema.courseReplaced,
          courseCertClaimed: schema.courseCertClaimed,
          adminTransferred: schema.adminTransferred,
          courseSuspended: schema.courseSuspended,
          courseUnsuspended: schema.courseUnsuspended,
          courseRemoved: schema.courseRemoved,
          coursePriceUpdated: schema.coursePriceUpdated,
          acquiredCourse: schema.acquiredCourse,
          courseApproved: schema.courseApproved,
          courseUnapproved: schema.courseUnapproved,
        },
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
