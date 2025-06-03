//  --- Add your pg table schemas here ----

// import { bigint, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  varchar,
  serial,
  unique,
} from "drizzle-orm/pg-core";

// Tables
export const courseCreated = pgTable(
  "course_created",
  {
    id: serial("id").primaryKey().notNull(),
    courseAddress: varchar("course_address", { length: 255 })
      .unique()
      .notNull(),
    courseCreator: varchar("course_creator", { length: 255 }).notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
    accessment: boolean("accessment").notNull(),
    baseUri: varchar("base_uri", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    symbol: varchar("symbol", { length: 255 }).notNull(),
    courseIpfsUri: varchar("course_ipfs_uri", { length: 255 }).notNull(),
    isApproved: boolean("is_approved").notNull(),
  },
  (table) => ({
    uniqueCourseCreatedIdentifier: unique(
      "unique_course_created_identifier"
    ).on(table.courseIdentifier),
  })
);

export const courseReplaced = pgTable(
  "course_replaced",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
    owner_: varchar("owner_", { length: 255 }).notNull(),
    newCourseUri: varchar("new_course_uri", { length: 255 }).notNull(),
  },
  (table) => ({
    uniqueCourseReplacedIdentifier: unique(
      "unique_course_replaced_identifier"
    ).on(table.courseIdentifier),
  })
);

export const courseCertClaimed = pgTable(
  "course_cert_claimed",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
    candidate: varchar("candidate", { length: 255 }).notNull(),
  },
  (table) => ({
    uniqueCourseCertClaimedIdentifier: unique(
      "unique_course_cert_claimed_identifier"
    ).on(table.courseIdentifier),
  })
);

export const adminTransferred = pgTable(
  "admin_transferred",
  {
    id: serial("id").primaryKey().notNull(),
    newAdmin: varchar("new_admin", { length: 255 }).notNull(),
  },
  (table) => ({
    uniqueAdminTransferredAdmin: unique("unique_admin_transferred_admin").on(
      table.newAdmin
    ),
  })
);

export const courseSuspended = pgTable(
  "course_suspended",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCourseSuspendedIdentifier: unique(
      "unique_course_suspended_identifier"
    ).on(table.courseIdentifier),
  })
);

export const courseUnsuspended = pgTable(
  "course_unsuspended",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCourseUnsuspendedIdentifier: unique(
      "unique_course_unsuspended_identifier"
    ).on(table.courseIdentifier),
  })
);

export const courseRemoved = pgTable(
  "course_removed",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCourseRemovedIdentifier: unique(
      "unique_course_removed_identifier"
    ).on(table.courseIdentifier),
  })
);

export const coursePriceUpdated = pgTable(
  "course_price_updated",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
    newPrice: bigint("new_price", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCoursePriceUpdatedIdentifier: unique(
      "unique_course_price_updated_identifier"
    ).on(table.courseIdentifier),
  })
);

export const acquiredCourse = pgTable(
  "acquired_course",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
    owner: varchar("owner", { length: 255 }).notNull(),
    candidate: varchar("candidate", { length: 255 }).notNull(),
  },
  (table) => ({
    uniqueAcquiredCourseIdentifierOwner: unique(
      "unique_acquired_course_identifier_owner"
    ).on(table.courseIdentifier, table.owner),
  })
);

export const courseApproved = pgTable(
  "course_approved",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCourseApprovedIdentifier: unique(
      "unique_course_approved_identifier"
    ).on(table.courseIdentifier),
  })
);

export const courseUnapproved = pgTable(
  "course_unapproved",
  {
    id: serial("id").primaryKey().notNull(),
    courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  },
  (table) => ({
    uniqueCourseUnapprovedIdentifier: unique(
      "unique_course_unapproved_identifier"
    ).on(table.courseIdentifier),
  })
);
