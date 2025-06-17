ALTER TABLE "course_created" DROP CONSTRAINT "course_created_course_address_unique";--> statement-breakpoint
ALTER TABLE "course_created" DROP CONSTRAINT "unique_course_created_identifier";--> statement-breakpoint
ALTER TABLE "course_created" ADD CONSTRAINT "unique_course_created_identifier" UNIQUE("course_identifier","course_creator");