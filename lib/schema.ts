//  --- Add your pg table schemas here ----

// import { bigint, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  integer,
} from "drizzle-orm/pg-core";

// Tables
export const courses = pgTable("course_created", {
  id: serial("id").primaryKey().notNull(),
  courseAddress: varchar("course_address", { length: 255 }).unique().notNull(),
  courseCreator: varchar("course_creator", { length: 255 }).notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  accessment: boolean("accessment").notNull(),
  baseUri: varchar("base_uri", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 255 }).notNull(),
  courseIpfsUri: varchar("course_ipfs_uri", { length: 255 }).notNull(),
  isApproved: boolean("is_approved").notNull(),
});

export const courseReplaced = pgTable("course_replaced", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  owner_: varchar("owner_", { length: 255 }).notNull(),
  newCourseUri: varchar("new_course_uri", { length: 255 }).notNull(),
});

export const courseCertClaimed = pgTable("course_cert_claimed", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  candidate: varchar("candidate", { length: 255 }).notNull(),
});

export const adminTransferred = pgTable("admin_transferred", {
  id: serial("id").primaryKey().notNull(),
  newAdmin: varchar("new_admin", { length: 255 }).notNull(),
});

export const courseSuspended = pgTable("course_suspended", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
});

export const courseUnsuspended = pgTable("course_unsuspended", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
});

export const courseRemoved = pgTable("course_removed", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
});

export const coursePriceUpdated = pgTable("course_price_updated", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  newPrice: bigint("new_price", { mode: "number" }).notNull(),
});

export const acquiredCourse = pgTable("acquired_course", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
  owner: varchar("owner", { length: 255 }).notNull(),
  candidate: varchar("candidate", { length: 255 }).notNull(),
});

export const courseApproved = pgTable("course_approved", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
});

export const courseUnapproved = pgTable("course_unapproved", {
  id: serial("id").primaryKey().notNull(),
  courseIdentifier: bigint("course_identifier", { mode: "number" }).notNull(),
});

// export const cursorTable = pgTable("cursor_table", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   endCursor: bigint("end_cursor", { mode: "number" }),
//   uniqueKey: text("unique_key"),
// });

export {};
