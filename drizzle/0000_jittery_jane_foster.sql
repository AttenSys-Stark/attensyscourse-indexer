CREATE TABLE "acquired_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"owner" varchar(255) NOT NULL,
	"candidate" varchar(255) NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_acquired_course_identifier_owner" UNIQUE("course_identifier","owner")
);
--> statement-breakpoint
CREATE TABLE "admin_transferred" (
	"id" serial PRIMARY KEY NOT NULL,
	"new_admin" varchar(255) NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_admin_transferred_admin" UNIQUE("new_admin")
);
--> statement-breakpoint
CREATE TABLE "course_approved" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_approved_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_cert_claimed" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"candidate" varchar(255) NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_cert_claimed_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_created" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_address" varchar(255) NOT NULL,
	"course_creator" varchar(255) NOT NULL,
	"course_identifier" bigint NOT NULL,
	"accessment" boolean NOT NULL,
	"base_uri" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(255) NOT NULL,
	"course_ipfs_uri" varchar(255) NOT NULL,
	"is_approved" boolean NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_created_identifier" UNIQUE("course_identifier","course_creator")
);
--> statement-breakpoint
CREATE TABLE "course_price_updated" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"new_price" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_price_updated_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_removed" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_removed_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_replaced" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"owner_" varchar(255) NOT NULL,
	"new_course_uri" varchar(255) NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_replaced_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_suspended" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_suspended_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_unapproved" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_unapproved_identifier" UNIQUE("course_identifier")
);
--> statement-breakpoint
CREATE TABLE "course_unsuspended" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" varchar(255) NOT NULL,
	CONSTRAINT "unique_course_unsuspended_identifier" UNIQUE("course_identifier")
);
