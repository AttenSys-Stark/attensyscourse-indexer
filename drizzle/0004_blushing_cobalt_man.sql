-- Add timestamp columns as nullable first
ALTER TABLE "acquired_course" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "admin_transferred" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_approved" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_cert_claimed" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_created" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_price_updated" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_removed" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_replaced" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_suspended" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_unapproved" ADD COLUMN "timestamp" varchar(255);
ALTER TABLE "course_unsuspended" ADD COLUMN "timestamp" varchar(255);

-- Update existing rows with a default value
UPDATE "acquired_course" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "admin_transferred" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_approved" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_cert_claimed" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_created" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_price_updated" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_removed" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_replaced" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_suspended" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_unapproved" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
UPDATE "course_unsuspended" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

-- Make the columns NOT NULL
ALTER TABLE "acquired_course" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "admin_transferred" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_approved" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_cert_claimed" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_created" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_price_updated" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_removed" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_replaced" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_suspended" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_unapproved" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "course_unsuspended" ALTER COLUMN "timestamp" SET NOT NULL; 