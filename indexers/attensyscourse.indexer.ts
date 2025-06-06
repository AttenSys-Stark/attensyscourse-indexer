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

  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const db = getDrizzlePgDatabase(postgresConnectionString);

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [
            // COURSE_CREATED,
            // COURSE_REPLACED,
            // COURSE_CERT_CLAIMED,
            // ADMIN_TRANSFERRED,
            // COURSE_SUSPENDED,
            // COURSE_UNSUSPENDED,
            // COURSE_REMOVED,
            // COURSE_PRICE_UPDATED,
            // ACQUIRED_COURSE,
            // COURSE_APPROVED,
            // COURSE_UNAPPROVED,
          ],
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
    async transform({
      endCursor,
      finality,
      block,
    }: {
      endCursor: string | bigint | { toString(): string };
      finality: string;
      block: any;
    }) {
      const logger = useLogger();

      const { events, header } = block;
      const currentBlockNumber = header?.blockNumber;

      // Enhanced logging for block progression
      logger.info(`Starting block configured: ${startingBlock}`);
      logger.info(`Current block being processed: ${currentBlockNumber}`);
      logger.info(`Block range: ${startingBlock} -> ${currentBlockNumber}`);
      logger.info(`Block finality: ${finality}`);

      // Safely log endCursor without BigInt serialization issues
      try {
        const cursorStr =
          typeof endCursor === "bigint"
            ? endCursor.toString()
            : JSON.stringify(endCursor);
        logger.info(`End cursor: ${cursorStr}`);
      } catch (error) {
        logger.info(`End cursor: [Unable to serialize]`);
      }

      // Check if we're processing blocks in order
      if (BigInt(currentBlockNumber) < BigInt(startingBlock)) {
        logger.warn(
          `Skipping block ${currentBlockNumber} as it's before our starting block ${startingBlock}`
        );
        return;
      }

      // Log block processing status
      logger.info(
        `Processing block ${currentBlockNumber} with ${events.length} events`
      );
      logger.info(
        `Contract address we're monitoring: ${attensysCourseAddress}`
      );

      // Process events in the block
      logger.info(
        `Found ${events.length} events in block ${currentBlockNumber}`
      );
      for (const event of events) {
        logger.info(`Event address: ${event.address}`);
        logger.info(`Event keys: ${event.keys.join(", ")}`);
        logger.info(`Event data: ${JSON.stringify(event.data)}`);
        logger.info(
          `Event keys in hex: ${event.keys.map((k: bigint) => k.toString(16)).join(", ")}`
        );
      }

      for (const event of events) {
        try {
          logger.info(
            `⛓️ Processing event ${event.eventIndex} from tx=${event.transactionHash}`
          );
          logger.info(`Event address: ${event.address}`);
          logger.info(`Event keys: ${event.keys.join(", ")}`);

          // Check if this event is from our contract
          if (
            event.address.toLowerCase() !== attensysCourseAddress.toLowerCase()
          ) {
            logger.info(
              `Skipping event from different contract: ${event.address}`
            );
            continue;
          }

          const { db: database } = useDrizzleStorage();
          const eventKey = event.keys[0];
          switch (eventKey) {
            case COURSE_CREATED:
              logger.info("Processing CourseCreated event");
              await handleCourseCreated(event, database);
              break;

            case COURSE_REPLACED:
              logger.info("Processing CourseReplaced event");
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
        endCursor,
        " | finality: ",
        finality
      );
    },
  });
}
