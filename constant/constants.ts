import { hash } from "starknet";

function selector(name: string): `0x${string}` {
  const hashValue = BigInt(hash.getSelectorFromName(name)).toString(16);
  return `0x${hashValue.padStart(64, "0")}` as `0x${string}`;
}

export const COURSE_CREATED = selector("CourseCreated");
export const COURSE_REPLACED = selector("CourseReplaced");
export const COURSE_CERT_CLAIMED = selector("CourseCertClaimed");
export const ADMIN_TRANSFERRED = selector("AdminTransferred");
export const COURSE_SUSPENDED = selector("CourseSuspended");
export const COURSE_UNSUSPENDED = selector("CourseUnsuspended");
export const COURSE_REMOVED = selector("CourseRemoved");
export const COURSE_PRICE_UPDATED = selector("CoursePriceUpdated");
export const ACQUIRED_COURSE = selector("AcquiredCourse");
export const COURSE_APPROVED = selector("CourseApproved");
export const COURSE_UNAPPROVED = selector("CourseUnapproved");
