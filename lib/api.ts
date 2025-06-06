import express from "express";
import cors from "cors";
import { getDrizzlePgDatabase } from "./db";
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
} from "./schema";
import { eq } from "drizzle-orm";

const app = express();
const port = process.env.PORT || 3001;

// Initialize database connection
let db;
try {
  const dbConfig = getDrizzlePgDatabase(process.env.DATABASE_URL || "postgres://localhost:5432/attensyscourse");
  db = dbConfig.db;
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Helper function to safely query tables
const safeQuery = async (table: any, res: express.Response, next: express.NextFunction) => {
  try {
    // First, check if the table exists and has data
    const result = await db.select().from(table);
    
    // Convert and validate the data
    const validResults = result.map(row => {
      // Create a new object to avoid modifying the original
      const processedRow = { ...row };
      
      // Handle courseIdentifier conversion
      if (processedRow.courseIdentifier !== undefined) {
        const courseId = Number(processedRow.courseIdentifier);
        if (!isNaN(courseId)) {
          processedRow.courseIdentifier = courseId;
        } else {
          console.warn(`Invalid courseIdentifier found: ${processedRow.courseIdentifier}`);
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

      return processedRow;
    }).filter(Boolean); // Remove any null entries

    res.json(validResults);
  } catch (error) {
    console.error(`Error querying ${table.name}:`, error);
    // Send a more specific error message
    res.status(500).json({ 
      error: `Error querying ${table.name}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all acquired courses
app.get("/api/courses/acquired", async (req, res, next) => {
  await safeQuery(acquiredCourse, res, next);
});

// Get all created courses
app.get("/api/courses/created", async (req, res, next) => {
  await safeQuery(courseCreated, res, next);
});

// Get all replaced courses
app.get("/api/courses/replaced", async (req, res, next) => {
  await safeQuery(courseReplaced, res, next);
});

// Get all cert claimed courses
app.get("/api/courses/cert-claimed", async (req, res, next) => {
  await safeQuery(courseCertClaimed, res, next);
});

// Get all admin transferred courses
app.get("/api/courses/admin-transferred", async (req, res, next) => {
  await safeQuery(adminTransferred, res, next);
});

// Get all suspended courses
app.get("/api/courses/suspended", async (req, res, next) => {
  await safeQuery(courseSuspended, res, next);
});

// Get all unsuspended courses
app.get("/api/courses/unsuspended", async (req, res, next) => {
  await safeQuery(courseUnsuspended, res, next);
});

// Get all removed courses
app.get("/api/courses/removed", async (req, res, next) => {
  await safeQuery(courseRemoved, res, next);
});

// Get all price updated courses
app.get("/api/courses/price-updated", async (req, res, next) => {
  await safeQuery(coursePriceUpdated, res, next);
});

// Get all approved courses
app.get("/api/courses/approved", async (req, res, next) => {
  await safeQuery(courseApproved, res, next);
});

// Get all unapproved courses
app.get("/api/courses/unapproved", async (req, res, next) => {
  await safeQuery(courseUnapproved, res, next);
});

// Get course by identifier
app.get("/api/courses/:identifier", async (req, res, next) => {
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

    res.json(course[0]);
  } catch (error) {
    next(error);
  }
});

// Get courses by owner
app.get("/api/courses/owner/:owner", async (req, res, next) => {
  try {
    const { owner } = req.params;
    const courses = await db
      .select()
      .from(acquiredCourse)
      .where(eq(acquiredCourse.owner, owner));

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

// Handle server errors
server.on('error', (error: Error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
