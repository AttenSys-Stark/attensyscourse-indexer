CREATE TABLE IF NOT EXISTS "acquired_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"owner" varchar(255) NOT NULL,
	"candidate" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_transferred" (
	"id" serial PRIMARY KEY NOT NULL,
	"new_admin" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_approved" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_cert_claimed" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"candidate" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_price_updated" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"new_price" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_removed" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_replaced" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL,
	"owner_" varchar(255) NOT NULL,
	"new_course_uri" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_suspended" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_unapproved" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_unsuspended" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_identifier" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
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
	CONSTRAINT "courses_course_address_unique" UNIQUE("course_address")
);
