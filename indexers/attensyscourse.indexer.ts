import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";
import { drizzleStorage, useDrizzleStorage } from "@apibara/plugin-drizzle";
import { StarknetStream } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
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
import {
  handleCourseCreated,
  handleCourseReplaced,
  handleCourseCertClaimed,
  handleAdminTransferred,
  handleCourseSuspended,
  handleCourseUnsuspended,
  handleCourseRemoved,
  handleCoursePriceUpdated,
  handleAcquiredCourse,
  handleCourseApproved,
  handleCourseUnapproved,
} from "../lib/handlers/course.handlers";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const {
    startingBlock,
    streamUrl,
    postgresConnectionString,
    attensysCourseAddress,
  } = runtimeConfig["attensyscourse"];

  const db = getDrizzlePgDatabase(postgresConnectionString);

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: attensysCourseAddress as `0x${string}`,
          // keys: [
          //   COURSE_CREATED,
          //   COURSE_REPLACED,
          //   COURSE_CERT_CLAIMED,
          //   ADMIN_TRANSFERRED,
          //   COURSE_SUSPENDED,
          //   COURSE_UNSUSPENDED,
          //   COURSE_REMOVED,
          //   COURSE_PRICE_UPDATED,
          //   ACQUIRED_COURSE,
          //   COURSE_APPROVED,
          //   COURSE_UNAPPROVED,
          // ],
        },
      ],
    },
    plugins: [
      drizzleStorage({
        db: db.db,
        migrate: { migrationsFolder: "./drizzle" },
        persistState: false,
      }),
    ],
    async transform({ endCursor, finality, block }) {
      const logger = useLogger();

      // logger.info(`Starting indexer from block ${startingBlock}`);
      // logger.info(`⛓️ Processing block: ${block.header.blockNumber}`);
      // logger.info(`Monitoring contract address: ${attensysCourseAddress}`);

      const { events, header } = block;

      if (events.length === 0) {
        logger.log(`No events found in block ${header?.blockNumber}`);
        logger.info("🚫 No events in this block");
        return;
      }

      // logger.info(
      //   `⛓️ Processing block ${header?.blockNumber} with ${events.length} events`
      // );

      for (const event of events) {
        try {
          logger.info(
            `⛓️ Processing event ${event.eventIndex} from tx=${event.transactionHash}`
          );
          logger.debug(`Event keys: ${event.keys.join(", ")}`);

          const { db: database } = useDrizzleStorage();
          const eventKey = event.keys[0];
          switch (eventKey) {
            case COURSE_CREATED:
              console.log("entered course created");
              await handleCourseCreated(event, database);
              break;

            case COURSE_REPLACED:
              console.log("entered course replaced");
              await handleCourseReplaced(event, database);
              break;

            case COURSE_CERT_CLAIMED:
              await handleCourseCertClaimed(event, database);
              break;

            case ADMIN_TRANSFERRED:
              await handleAdminTransferred(event, database);
              break;

            case COURSE_SUSPENDED:
              await handleCourseSuspended(event, database);
              break;

            case COURSE_UNSUSPENDED:
              await handleCourseUnsuspended(event, database);
              break;

            case COURSE_REMOVED:
              await handleCourseRemoved(event, database);
              break;

            case COURSE_PRICE_UPDATED:
              await handleCoursePriceUpdated(event, database);
              break;

            case ACQUIRED_COURSE:
              await handleAcquiredCourse(event, database);
              break;

            case COURSE_APPROVED:
              await handleCourseApproved(event, database);
              break;

            case COURSE_UNAPPROVED:
              await handleCourseUnapproved(event, database);
              break;

            default:
              logger.warn(`Unknown event key: ${eventKey}`);
              break;
          }
        } catch (error) {
          logger.error(`Error processing event ${event.eventIndex}: ${error}`);
          // Don't throw here to continue processing other events
        }
      }

      logger.info(
        "Completed processing block | orderKey: ",
        endCursor?.orderKey,
        " | finality: ",
        finality
      );
    },
  });
}
