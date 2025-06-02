ALTER TABLE "courses" RENAME TO "course_created";--> statement-breakpoint
ALTER TABLE "course_created" DROP CONSTRAINT "courses_course_address_unique";--> statement-breakpoint
ALTER TABLE "course_created" ADD CONSTRAINT "course_created_course_address_unique" UNIQUE("course_address");