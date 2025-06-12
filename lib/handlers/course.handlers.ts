import { decodeEvent } from "@apibara/starknet";
import { attensysCourseAbi } from "../../abi/abi";
import {
  courseCreated,
  courseReplaced,
  courseCertClaimed,
  adminTransferred,
  courseSuspended,
  courseUnsuspended,
  courseRemoved,
  coursePriceUpdated,
  acquiredCourse,
  courseApproved,
  courseUnapproved,
} from "../schema";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { Abi } from "starknet";
import { useLogger } from "apibara/plugins";

const stripHexPrefix = (hex: string) =>
  hex.startsWith("0x") ? hex.slice(2) : hex;
const hexToUtf8 = (hex: string) =>
  Buffer.from(stripHexPrefix(hex), "hex").toString("utf8");

export async function handleCourseCreated(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseCreated event: ${event.transactionHash}`);

    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseCreated",
      event: event,
    });

    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }

    // Convert BigInt values to strings for logging
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );

    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);

    const {
      course_identifier,
      owner_,
      accessment_,
      base_uri,
      name_,
      symbol,
      course_ipfs_uri,
      is_approved,
    } = decodedEvent.args;

    // Convert BigInt to number for database storage
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);

    const values = {
      courseAddress: event.address as string,
      courseCreator: owner_ as string,
      courseIdentifier,
      accessment: accessment_ as boolean,
      baseUri: hexToUtf8(base_uri),
      name: hexToUtf8(name_),
      symbol: hexToUtf8(symbol),
      courseIpfsUri: hexToUtf8(course_ipfs_uri),
      isApproved: is_approved as boolean,
      blockNumber: blockNumber,
    };

    // Log values safely
    const logValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );

    logger.info(`Attempting to insert values: ${JSON.stringify(logValues)}`);

    try {
      const result = await db
        .insert(courseCreated)
        .values(values)
        .onConflictDoUpdate({
          target: [courseCreated.courseIdentifier],
          set: {
            courseAddress: values.courseAddress,
            courseCreator: values.courseCreator,
            accessment: values.accessment,
            baseUri: values.baseUri,
            name: values.name,
            symbol: values.symbol,
            courseIpfsUri: values.courseIpfsUri,
            isApproved: values.isApproved,
            blockNumber: values.blockNumber,
          },
        })
        .returning();

      console.log("Insert result:", result);
      logger.info("Successfully processed CourseCreated event");
    } catch (error) {
      console.error(`Error in handleCourseCreated: ${error}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Error in handleCourseCreated: ${error}`);
    throw error;
  }
}

export async function handleCourseReplaced(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseReplaced event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseReplaced",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier, owner_, new_course_uri } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      owner_: owner_ as string,
      newCourseUri: new_course_uri as string,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(courseReplaced)
      .values(values)
      .onConflictDoUpdate({
        target: courseReplaced.courseIdentifier,
        set: {
          newCourseUri: values.newCourseUri,
          blockNumber: values.blockNumber,
        },
      });
    logger.info("Successfully processed CourseReplaced event");
  } catch (error) {
    logger.error(`Error in handleCourseReplaced: ${error}`);
    throw error;
  }
}

export async function handleCourseCertClaimed(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseCertClaimed event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseCertClaimed",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier, candidate } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      candidate: candidate as string,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(courseCertClaimed)
      .values(values)
      .onConflictDoUpdate({
        target: courseCertClaimed.courseIdentifier,
        set: {
          candidate: values.candidate,
          blockNumber: values.blockNumber,
        },
      });
    logger.info("Successfully processed CourseCertClaimed event");
  } catch (error) {
    logger.error(`Error in handleCourseCertClaimed: ${error}`);
    throw error;
  }
}

export async function handleAdminTransferred(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing AdminTransferred event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::AdminTransferred",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { new_admin } = decodedEvent.args;
    const values = {
      newAdmin: new_admin as string,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(adminTransferred)
      .values(values)
      .onConflictDoUpdate({
        target: adminTransferred.newAdmin,
        set: {
          newAdmin: values.newAdmin,
          blockNumber: values.blockNumber,
        },
      });
    logger.info("Successfully processed AdminTransferred event");
  } catch (error) {
    logger.error(`Error in handleAdminTransferred: ${error}`);
    throw error;
  }
}

export async function handleCourseSuspended(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseSuspended event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseSuspended",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseSuspended).values(values);
    logger.info("Successfully processed CourseSuspended event");
  } catch (error) {
    logger.error(`Error in handleCourseSuspended: ${error}`);
    throw error;
  }
}

export async function handleCourseUnsuspended(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseUnsuspended event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseUnsuspended",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseUnsuspended).values(values);
    logger.info("Successfully processed CourseUnsuspended event");
  } catch (error) {
    logger.error(`Error in handleCourseUnsuspended: ${error}`);
    throw error;
  }
}

export async function handleCourseRemoved(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseRemoved event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseRemoved",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(courseRemoved)
      .values(values)
      .onConflictDoUpdate({
        target: courseRemoved.courseIdentifier,
        set: {
          courseIdentifier: values.courseIdentifier,
        },
      });
    logger.info("Successfully processed CourseRemoved event");
  } catch (error) {
    logger.error(`Error in handleCourseRemoved: ${error}`);
    throw error;
  }
}

export async function handleCoursePriceUpdated(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(
      `Processing CoursePriceUpdated event: ${event.transactionHash}`
    );
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CoursePriceUpdated",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier, new_price } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const newPrice =
      typeof new_price === "bigint" ? Number(new_price) : Number(new_price);
    const values = {
      courseIdentifier,
      newPrice,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(coursePriceUpdated)
      .values(values)
      .onConflictDoUpdate({
        target: coursePriceUpdated.courseIdentifier,
        set: {
          newPrice: values.newPrice,
        },
      });
    logger.info("Successfully processed CoursePriceUpdated event");
  } catch (error) {
    logger.error(`Error in handleCoursePriceUpdated: ${error}`);
    throw error;
  }
}

export async function handleAcquiredCourse(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing AcquiredCourse event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::AcquiredCourse",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier, owner, candidate } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      owner: owner as string,
      candidate: candidate as string,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(acquiredCourse)
      .values(values)
      .onConflictDoUpdate({
        target: [acquiredCourse.courseIdentifier, acquiredCourse.owner],
        set: {
          candidate: values.candidate,
          blockNumber: values.blockNumber,
        },
      });
    logger.info("Successfully processed AcquiredCourse event");
  } catch (error) {
    logger.error(`Error in handleAcquiredCourse: ${error}`);
    throw error;
  }
}

export async function handleCourseApproved(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseApproved event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseApproved",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(courseApproved)
      .values(values)
      .onConflictDoUpdate({
        target: courseApproved.courseIdentifier,
        set: {
          blockNumber: values.blockNumber,
        },
      });
    logger.info("Successfully processed CourseApproved event");
  } catch (error) {
    logger.error(`Error in handleCourseApproved: ${error}`);
    throw error;
  }
}

export async function handleCourseUnapproved(
  event: any,
  blockNumber: any,
  db: PgDatabase<any, any, any>
) {
  const logger = useLogger();
  try {
    logger.info(`Processing CourseUnapproved event: ${event.transactionHash}`);
    const decodedEvent = decodeEvent({
      abi: attensysCourseAbi as Abi,
      eventName:
        "attendsys::contracts::course::AttenSysCourse::AttenSysCourse::CourseUnapproved",
      event: event,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error("Failed to decode event or event args are missing");
    }
    const logArgs = Object.entries(decodedEvent.args).reduce(
      (acc, [key, value]) => {
        acc[key] = typeof value === "bigint" ? String(value) : value;
        return acc;
      },
      {} as Record<string, any>
    );
    logger.info(`Decoded event args: ${JSON.stringify(logArgs)}`);
    const { course_identifier } = decodedEvent.args;
    const courseIdentifier =
      typeof course_identifier === "bigint"
        ? Number(course_identifier)
        : Number(course_identifier);
    const values = {
      courseIdentifier,
      blockNumber: Number(blockNumber),
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseUnapproved).values(values);
    logger.info("Successfully processed CourseUnapproved event");
  } catch (error) {
    logger.error(`Error in handleCourseUnapproved: ${error}`);
    throw error;
  }
}
