import { decodeEvent } from "@apibara/starknet";
import { attensysCourseAbi } from "../../abi/abi";
import { courses } from "../schema";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { Abi } from "starknet";

export async function handleCourseCreated(
  event: any,
  db: PgDatabase<any, any, any>
) {
  const decodedEvent = decodeEvent({
    abi: attensysCourseAbi as Abi,
    eventName: "attendsys::contracts::course::AttenSysCourse::CourseCreated",
    event: event,
  });

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

  await db
    .insert(courses)
    .values({
      courseAddress: event.address as string,
      courseCreator: owner_ as string,
      courseIdentifier: course_identifier as number,
      accessment: accessment_ as boolean,
      baseUri: base_uri as string,
      name: name_ as string,
      symbol: symbol as string,
      courseIpfsUri: course_ipfs_uri as string,
      isApproved: is_approved as boolean,
    })
    .onConflictDoUpdate({
      target: courses.courseAddress,
      set: {},
    });
}

export async function handleCourseReplaced(
  event: any,
  db: PgDatabase<any, any, any>
) {
  const decodedEvent = decodeEvent({
    abi: attensysCourseAbi as Abi,
    eventName: "attendsys::contracts::course::AttenSysCourse::CourseReplaced",
    event: event,
  });
  
  
}