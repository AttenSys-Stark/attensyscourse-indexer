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

export async function handleCourseCreated(
  event: any,
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
      baseUri: base_uri as string,
      name: name_ as string,
      symbol: symbol as string,
      courseIpfsUri: course_ipfs_uri as string,
      isApproved: is_approved as boolean,
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

    await db.insert(courseCreated).values(values).onConflictDoUpdate({
      target: courseCreated.courseAddress,
      set: values,
    });

    logger.info("Successfully processed CourseCreated event");
  } catch (error) {
    logger.error(`Error in handleCourseCreated: ${error}`);
    throw error;
  }
}

export async function handleCourseReplaced(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseReplaced).values(values).onConflictDoUpdate({
      target: courseReplaced.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseReplaced event");
  } catch (error) {
    logger.error(`Error in handleCourseReplaced: ${error}`);
    throw error;
  }
}

export async function handleCourseCertClaimed(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseCertClaimed).values(values).onConflictDoUpdate({
      target: courseCertClaimed.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseCertClaimed event");
  } catch (error) {
    logger.error(`Error in handleCourseCertClaimed: ${error}`);
    throw error;
  }
}

export async function handleAdminTransferred(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(adminTransferred).values(values).onConflictDoUpdate({
      target: adminTransferred.newAdmin,
      set: values,
    });
    logger.info("Successfully processed AdminTransferred event");
  } catch (error) {
    logger.error(`Error in handleAdminTransferred: ${error}`);
    throw error;
  }
}

export async function handleCourseSuspended(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseSuspended).values(values).onConflictDoUpdate({
      target: courseSuspended.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseSuspended event");
  } catch (error) {
    logger.error(`Error in handleCourseSuspended: ${error}`);
    throw error;
  }
}

export async function handleCourseUnsuspended(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseUnsuspended).values(values).onConflictDoUpdate({
      target: courseUnsuspended.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseUnsuspended event");
  } catch (error) {
    logger.error(`Error in handleCourseUnsuspended: ${error}`);
    throw error;
  }
}

export async function handleCourseRemoved(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseRemoved).values(values).onConflictDoUpdate({
      target: courseRemoved.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseRemoved event");
  } catch (error) {
    logger.error(`Error in handleCourseRemoved: ${error}`);
    throw error;
  }
}

export async function handleCoursePriceUpdated(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(coursePriceUpdated).values(values).onConflictDoUpdate({
      target: coursePriceUpdated.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CoursePriceUpdated event");
  } catch (error) {
    logger.error(`Error in handleCoursePriceUpdated: ${error}`);
    throw error;
  }
}

export async function handleAcquiredCourse(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db
      .insert(acquiredCourse)
      .values(values)
      .onConflictDoUpdate({
        target: [acquiredCourse.courseIdentifier, acquiredCourse.owner],
        set: values,
      });
    logger.info("Successfully processed AcquiredCourse event");
  } catch (error) {
    logger.error(`Error in handleAcquiredCourse: ${error}`);
    throw error;
  }
}

export async function handleCourseApproved(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseApproved).values(values).onConflictDoUpdate({
      target: courseApproved.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseApproved event");
  } catch (error) {
    logger.error(`Error in handleCourseApproved: ${error}`);
    throw error;
  }
}

export async function handleCourseUnapproved(
  event: any,
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
    };
    logger.info(`Attempting to insert values: ${JSON.stringify(values)}`);
    await db.insert(courseUnapproved).values(values).onConflictDoUpdate({
      target: courseUnapproved.courseIdentifier,
      set: values,
    });
    logger.info("Successfully processed CourseUnapproved event");
  } catch (error) {
    logger.error(`Error in handleCourseUnapproved: ${error}`);
    throw error;
  }
}
