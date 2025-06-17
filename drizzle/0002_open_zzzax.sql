ALTER TABLE "course_created" DROP CONSTRAINT "course_created_course_identifier_unique";

-- Add timestamp column as nullable first
ALTER TABLE "acquired_course" ADD COLUMN "timestamp" varchar(255);

-- Update existing rows with a default value (using current timestamp)
UPDATE "acquired_course" SET "timestamp" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

-- Make the column NOT NULL
ALTER TABLE "acquired_course" ALTER COLUMN "timestamp" SET NOT NULL;