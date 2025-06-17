import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { getDrizzlePgDatabase } from "./db.js";
import {
  acquiredCourse,
  courseCreated,
  courseReplaced,
  courseCertClaimed,
  adminTransferred,
  courseSuspended,
  courseUnsuspended,
  courseRemoved,
  coursePriceUpdated,
  courseApproved,
  courseUnapproved,
} from "./schema.js";
import { eq, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const app = express();
const port = process.env.PORT || 3001;

// Initialize database connection
let db;

try {
  console.log("Initializing database connection...");
  const dbConfig = getDrizzlePgDatabase(
    process.env.DATABASE_URL || "postgres://localhost:5432/attensyscourse"
  );
  db = dbConfig.db;
  console.log("Database connection initialized successfully");
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error in request:", {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Helper function to safely query tables
const safeQuery = async (
  table: PgTable<any>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`Querying table: ${(table as any).name}`);
    // First, check if the table exists and has data
    const result = await db.select().from(table);
    console.log(`Found ${result.length} rows in table ${(table as any).name}`);

    // Convert and validate the data
    const validResults = result
      .map((row) => {
        try {
          // Create a new object to avoid modifying the original
          const processedRow = { ...row };

          // Handle courseIdentifier conversion
          if (processedRow.courseIdentifier !== undefined) {
            const courseId = Number(processedRow.courseIdentifier);
            if (!isNaN(courseId)) {
              processedRow.courseIdentifier = courseId;
            } else {
              console.warn(
                `Invalid courseIdentifier found: ${processedRow.courseIdentifier}`
              );
              return null;
            }
          }

          // Handle newPrice conversion if it exists (for price updated courses)
          if (processedRow.newPrice !== undefined) {
            const price = Number(processedRow.newPrice);
            if (!isNaN(price)) {
              processedRow.newPrice = price;
            } else {
              console.warn(`Invalid newPrice found: ${processedRow.newPrice}`);
              return null;
            }
          }

          // Handle timestamp formatting
          if (processedRow.timestamp) {
            try {
              // Ensure timestamp is in ISO format
              const date = new Date(processedRow.timestamp);
              if (!isNaN(date.getTime())) {
                processedRow.timestamp = date.toISOString();
              } else {
                console.warn(
                  `Invalid timestamp found: ${processedRow.timestamp}`
                );
                // Keep original timestamp if conversion fails
              }
            } catch (error) {
              console.warn(`Error processing timestamp: ${error}`);
              // Keep original timestamp if conversion fails
            }
          }

          return processedRow;
        } catch (error) {
          console.error(`Error processing row:`, error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries

    console.log(`Returning ${validResults.length} valid results`);
    res.json(validResults);
  } catch (error) {
    console.error(`Error querying table ${(table as any).name}:`, error);
    // Send a more specific error message
    res.status(500).json({
      error: `Error querying table ${(table as any).name}`,
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all acquired courses
app.get(
  "/api/courses/acquired",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(acquiredCourse, res, next);
  }
);

// Get all created courses
app.get(
  "/api/courses/created",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseCreated, res, next);
  }
);

// Get all replaced courses
app.get(
  "/api/courses/replaced",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseReplaced, res, next);
  }
);

// Get all cert claimed courses
app.get(
  "/api/courses/cert-claimed",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseCertClaimed, res, next);
  }
);

// Get all admin transferred courses
app.get(
  "/api/courses/admin-transferred",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(adminTransferred, res, next);
  }
);

// Get all suspended courses
app.get(
  "/api/courses/suspended",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseSuspended, res, next);
  }
);

// Get all unsuspended courses
app.get(
  "/api/courses/unsuspended",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseUnsuspended, res, next);
  }
);

// Get all removed courses
app.get(
  "/api/courses/removed",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseRemoved, res, next);
  }
);

// Get all price updated courses
app.get(
  "/api/courses/price-updated",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(coursePriceUpdated, res, next);
  }
);

// Get all approved courses
app.get(
  "/api/courses/approved",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseApproved, res, next);
  }
);

// Get all unapproved courses
app.get(
  "/api/courses/unapproved",
  async (req: Request, res: Response, next: NextFunction) => {
    await safeQuery(courseUnapproved, res, next);
  }
);

// Get course by identifier
app.get(
  "/api/courses/:identifier",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier } = req.params;
      const courseId = parseInt(identifier);

      if (isNaN(courseId)) {
        return res.status(400).json({ error: "Invalid course identifier" });
      }

      const course = await db
        .select()
        .from(courseCreated)
        .where(eq(courseCreated.courseIdentifier, courseId));

      if (!course.length) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Process the course data
      const processedCourse = { ...course[0] };

      // Handle timestamp formatting
      if (processedCourse.timestamp) {
        try {
          const date = new Date(processedCourse.timestamp);
          if (!isNaN(date.getTime())) {
            processedCourse.timestamp = date.toISOString();
          }
        } catch (error) {
          console.warn(`Error processing timestamp: ${error}`);
        }
      }

      res.json(processedCourse);
    } catch (error) {
      next(error);
    }
  }
);

// Get courses by owner
app.get(
  "/api/courses/owner/:owner",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { owner } = req.params;
      const courses = await db
        .select()
        .from(acquiredCourse)
        .where(eq(acquiredCourse.owner, owner));

      // Process each course's timestamp
      const processedCourses = courses.map((course) => {
        const processedCourse = { ...course };
        if (processedCourse.timestamp) {
          try {
            const date = new Date(processedCourse.timestamp);
            if (!isNaN(date.getTime())) {
              processedCourse.timestamp = date.toISOString();
            }
          } catch (error) {
            console.warn(`Error processing timestamp: ${error}`);
          }
        }
        return processedCourse;
      });

      res.json(processedCourses);
    } catch (error) {
      next(error);
    }
  }
);

// Get total event counts
app.get(
  "/api/events/count",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const counts = {
        acquiredCourses: await db
          .select({ count: sql`count(*)` })
          .from(acquiredCourse),
        createdCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseCreated),
        replacedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseReplaced),
        certClaimedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseCertClaimed),
        adminTransferred: await db
          .select({ count: sql`count(*)` })
          .from(adminTransferred),
        suspendedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseSuspended),
        unsuspendedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseUnsuspended),
        removedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseRemoved),
        priceUpdatedCourses: await db
          .select({ count: sql`count(*)` })
          .from(coursePriceUpdated),
        approvedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseApproved),
        unapprovedCourses: await db
          .select({ count: sql`count(*)` })
          .from(courseUnapproved),
      };

      // Calculate total events
      const totalEvents = Object.values(counts).reduce(
        (sum, result) => sum + Number(result[0].count),
        0
      );

      res.json({
        totalEvents,
        eventBreakdown: {
          acquiredCourses: Number(counts.acquiredCourses[0].count),
          createdCourses: Number(counts.createdCourses[0].count),
          replacedCourses: Number(counts.replacedCourses[0].count),
          certClaimedCourses: Number(counts.certClaimedCourses[0].count),
          adminTransferred: Number(counts.adminTransferred[0].count),
          suspendedCourses: Number(counts.suspendedCourses[0].count),
          unsuspendedCourses: Number(counts.unsuspendedCourses[0].count),
          removedCourses: Number(counts.removedCourses[0].count),
          priceUpdatedCourses: Number(counts.priceUpdatedCourses[0].count),
          approvedCourses: Number(counts.approvedCourses[0].count),
          unapprovedCourses: Number(counts.unapprovedCourses[0].count),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Start server
const server = app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

// Handle server errors
server.on("error", (error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
