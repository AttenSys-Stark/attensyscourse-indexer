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
          keys: [COURSE_CREATED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_REPLACED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_CERT_CLAIMED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [ADMIN_TRANSFERRED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_SUSPENDED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_UNSUSPENDED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_REMOVED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_PRICE_UPDATED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [ACQUIRED_COURSE],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_APPROVED],
        },
        {
          address: attensysCourseAddress as `0x${string}`,
          keys: [COURSE_UNAPPROVED],
        },
      ],
    },
    plugins: [
      drizzleStorage({
        db: db.db,
        migrate: { migrationsFolder: "./drizzle" },
        persistState: true,
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
      const timestamp = header?.timestamp;

      if (events.length === 0) {
        logger.log(`No events found in block ${header?.blockNumber}`);
        return;
      }
      // Process events in the block
      logger.info(
        `Found ${events.length} events in block ${currentBlockNumber}`
      );

      for (const event of events) {
        try {
          logger.info(
            `⛓️ Processing event ${event.eventIndex} from tx=${event.transactionHash}`
          );

          const { db: database } = useDrizzleStorage();

          const eventKey = event.keys[0];
          switch (eventKey) {
            case COURSE_CREATED:
              logger.info("Processing CourseCreated event");
              await handleCourseCreated(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_REPLACED:
              logger.info("Processing CourseReplaced event");
              await handleCourseReplaced(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_CERT_CLAIMED:
              await handleCourseCertClaimed(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case ADMIN_TRANSFERRED:
              await handleAdminTransferred(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_SUSPENDED:
              await handleCourseSuspended(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_UNSUSPENDED:
              await handleCourseUnsuspended(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_REMOVED:
              await handleCourseRemoved(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_PRICE_UPDATED:
              await handleCoursePriceUpdated(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case ACQUIRED_COURSE:
              await handleAcquiredCourse(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_APPROVED:
              await handleCourseApproved(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
              break;

            case COURSE_UNAPPROVED:
              await handleCourseUnapproved(
                event,
                currentBlockNumber,
                timestamp,
                database
              );
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
