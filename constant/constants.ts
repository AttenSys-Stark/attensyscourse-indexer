import { hash } from "starknet";

export const COURSE_CREATED = hash.getSelectorFromName(
  "CourseCreated"
) as `0x${string}`;
export const COURSE_REPLACED = hash.getSelectorFromName(
  "CourseReplaced"
) as `0x${string}`;
export const COURSE_CERT_CLAIMED = hash.getSelectorFromName(
  "CourseCertClaimed"
) as `0x${string}`;
export const ADMIN_TRANSFERRED = hash.getSelectorFromName(
  "AdminTransferred"
) as `0x${string}`;
export const COURSE_SUSPENDED = hash.getSelectorFromName(
  "CourseSuspended"
) as `0x${string}`;
export const COURSE_UNSUSPENDED = hash.getSelectorFromName(
  "CourseUnsuspended"
) as `0x${string}`;
export const COURSE_REMOVED = hash.getSelectorFromName(
  "CourseRemoved"
) as `0x${string}`;
export const COURSE_PRICE_UPDATED = hash.getSelectorFromName(
  "CoursePriceUpdated"
) as `0x${string}`;
export const ACQUIRED_COURSE = hash.getSelectorFromName(
  "AcquiredCourse"
) as `0x${string}`;
export const COURSE_APPROVED = hash.getSelectorFromName(
  "CourseApproved"
) as `0x${string}`;
export const COURSE_UNAPPROVED = hash.getSelectorFromName(
  "CourseUnapproved"
) as `0x${string}`;
