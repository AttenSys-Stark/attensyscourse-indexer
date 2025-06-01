import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";
import { drizzleStorage, useDrizzleStorage } from "@apibara/plugin-drizzle";
import { drizzle } from "@apibara/plugin-drizzle";
import { StarknetStream } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import * as schema from "../lib/schema";
import {
  COURSE_CREATED,
  COURSE_REPLACED,
  COURSE_CERT_CLAIMED,
  ADMIN_TRANSFERRED,
  COURSE_SUSPENDED,
  COURSE_UNSUSPENDED,
  COURSE_REMOVED,
  COURSE_PRICE_UPDATED,
  ACQUIRED_COURSE,
  COURSE_APPROVED,
  COURSE_UNAPPROVED,
} from "../constant/constants";
import { getDrizzlePgDatabase } from "../lib/db";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl, postgresConnectionString, attensysCourseAddress } =
    runtimeConfig["attensyscourse"];
  const db = getDrizzlePgDatabase(postgresConnectionString);

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: attensysCourseAddress,
          keys: [
            COURSE_CREATED,
            COURSE_REPLACED,
            COURSE_CERT_CLAIMED,
            ADMIN_TRANSFERRED,
            COURSE_SUSPENDED,
            COURSE_UNSUSPENDED,
            COURSE_REMOVED,
            COURSE_PRICE_UPDATED,
            ACQUIRED_COURSE,
            COURSE_APPROVED,
            COURSE_UNAPPROVED,
          ],
        },
      ],
    },
    plugins: [
      drizzleStorage({ db, migrate: { migrationsFolder: "./drizzle" } }),
    ],
    async transform({ endCursor, finality, block }) {
      const logger = useLogger();

    
      const { events, header } = block;

      if (events.length === 0) {
        logger.log(`No events found in block ${header?.blockNumber}`);
        return;
      }
      
      for (const event of events) {
        logger.log(`Event ${event.eventIndex} tx=${event.transactionHash}`);

         // Example snippet to insert data into db using drizzle with postgres
         const { db: database } = useDrizzleStorage();
         const eventKey = event.keys[0];

         switch (eventKey) {
          case COURSE_CREATED:
           //@todo 
            break;

          case COURSE_REPLACED:
            //@todo 
            break;

          case COURSE_CERT_CLAIMED:
            //@todo 
            break;

          case ADMIN_TRANSFERRED:
            //@todo 
            break;

          case COURSE_SUSPENDED:
            //@todo 
            break;

          case COURSE_UNSUSPENDED:
            //@todo 
            break;

          case COURSE_REMOVED:
            //@todo 
            break;

          case COURSE_PRICE_UPDATED:
            //@todo 
            break;

          case ACQUIRED_COURSE:
            //@todo 
            break;

          case COURSE_APPROVED:
            //@todo 
            break;

          case COURSE_UNAPPROVED:
            //@todo 
            break;

          default:
            logger.log(`Unknown event key: ${eventKey}`);
            break;
         }

         
      }
     

      // await database.insert(schema.cursorTable).values({
      //   endCursor: Number(endCursor?.orderKey),
      //   uniqueKey: `${endCursor?.uniqueKey}`,
      // });

      logger.info(
        "Transforming block | orderKey: ",
        endCursor?.orderKey,
        " | finality: ",
        finality
      );
    },
  });
}
