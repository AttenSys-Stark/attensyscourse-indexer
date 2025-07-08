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
import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://attensys.xyz",
  "https://www.attensys.xyz",
];

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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create an HTTP server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const meetings = {};
const users = {};

const sessions: any = {};

io.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "register-laptop") {
      // Laptop registers with a session ID
      sessions[data.sessionId] = { laptop: ws, phone: null };
      console.log(`Laptop registered for session: ${data.sessionId}`);
    } else if (data.type === "register-phone") {
      // Phone registers with a session ID
      if (sessions[data.sessionId]) {
        sessions[data.sessionId].phone = ws;
        console.log(`Phone registered for session: ${data.sessionId}`);
      } else {
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid session ID" })
        );
      }
    } else if (data.type === "scan") {
      // Forward scanned data from phone to laptop
      const session = sessions[data.sessionId];
      if (session && session.laptop) {
        session.laptop.send(
          JSON.stringify({ type: "action", data: data.scannedData })
        );
        console.log(
          `Scanned data forwarded to laptop for session: ${data.sessionId}`
        );
      }
    }
  });
});

// Generate QR code as a data URL
async function generateQRCode(eventId: any, attendeeaddress: any) {
  const qrCodeData = JSON.stringify({
    eventId,
    attendeeaddress,
  });

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData); // Generate QR code as a data URL
    return qrCodeDataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

// Upload QR code image to Cloudinary
async function uploadQRCodeToCloudinary(dataUrl: any) {
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      resource_type: "image",
    });
    return result.secure_url; // Publicly accessible URL of the uploaded image
  } catch (err) {
    console.error("Error uploading QR code to Cloudinary:", err);
    throw err;
  }
}

// Send email with QR code
async function sendEmailWithQRCode(
  email: any,
  qrCodeImageUrl: any,
  walletAddress: any,
  id: any,
  eventName: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${eventName} Registration Confirmation`,
    html: `
      <h1>Thank you for registering for ${eventName}! We're excited to have you join us!</h1>
      <p>Here is your QR code for event entry:</p>
      <img src="${qrCodeImageUrl}" alt="QR Code" />
      <p>Please present this QR code at the entrance for seamless check-in.</p>
      <p>For more details, visit: <a href="http://www.attensys.xyz">www.attensys.xyz</a></p>
      <p>We look forward to seeing you there!</p>
      <p>Best regards, AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email notification functions
async function sendWelcomeEmail(email: any, username: any) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to AttenSys!",
    html: `
      <h1>Welcome to AttenSys, ${username}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>With AttenSys, you can:</p>
      <ul>
        <li>Create and manage courses</li>
        <li>Purchase courses</li>
        <li>Learn new skills</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendLoginNotification(email: any, username: any) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "New Login to Your AttenSys Account",
    html: `
      <h1>New Login Alert</h1>
      <p>Hello ${username},</p>
      <p>We detected a new login to your AttenSys account.</p>
      <p>Login Details:</p>
      <ul>
        <li>Time: ${new Date().toLocaleString()}</li>
      </ul>
      <p>If this wasn't you, please contact our support team immediately.</p>
      <p>Best regards,<br>AttenSys Security Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendCourseApprovalNotification(
  email: any,
  username: any,
  courseName: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Course Has Been Approved!",
    html: `
      <h1>Course Approval Notification</h1>
      <p>Hello ${username},</p>
      <p>Great news! Your course "${courseName}" has been approved by our admin team.</p>
      <p>You can now start managing your course and tracking attendance.</p>
      <p>Best regards,<br>AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function notifyAdminNewCourse(
  adminEmail: any,
  creatorName: any,
  courseName: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: "New Course Created - Requires Approval",
    html: `
      <h1>New Course Created</h1>
      <p>A new course has been created and requires your approval.</p>
      <p>Course Details:</p>
      <ul>
        <li>Course Name: ${courseName}</li>
        <li>Created By: ${creatorName}</li>
        <li>Creation Time: ${new Date().toLocaleString()}</li>
      </ul>
      <p>Please review the course in the admin panel.</p>
      <p>Best regards,<br>AttenSys System</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function notifyCourseCreation(
  email: any,
  username: any,
  courseName: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Course Creation Confirmation",
    html: `
      <h1>Course Creation Confirmation</h1>
      <p>Hello ${username},</p>
      <p>Your course "${courseName}" has been successfully created and submitted for review.</p>
      <p>Please note that course approval typically takes up to 48 hours. You will receive another email once your course has been reviewed.</p>
      <p>In the meantime, you can:</p>
      <ul>
        <li>Review your course details</li>
        <li>Prepare additional materials</li>
        <li>Set up your course schedule</li>
      </ul>
      <p>Best regards,<br>AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendCourseDisapprovalNotification(
  email: any,
  username: any,
  courseName: any,
  reason: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Course Review Update",
    html: `
      <h1>Course Review Update</h1>
      <p>Hello ${username},</p>
      <p>We regret to inform you that your course "${courseName}" has not been approved at this time.</p>
      <p>Reason for disapproval: ${reason}</p>
      <p>You can:</p>
      <ul>
        <li>Review and address the feedback provided</li>
        <li>Make necessary modifications to your course</li>
        <li>Resubmit your course for review</li>
      </ul>
      <p>If you have any questions or need clarification, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendCoursePurchaseNotification(
  email: any,
  username: any,
  courseName: any,
  price: any
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Course Purchase Confirmation",
    html: `
      <h1>Course Purchase Confirmation</h1>
      <p>Hello ${username},</p>
      <p>Thank you for purchasing "${courseName}" on AttenSys!</p>
      <p>Purchase Details:</p>
      <ul>
        <li>Course: ${courseName}</li>
        <li>Price: $${price} STRK</li>
        <li>Purchase Date: ${new Date().toLocaleString()}</li>
      </ul>
      <p>You can now access your course content immediately. Here's what you can do next:</p>
      <ul>
        <li>Start learning with the course materials</li>
        <li>Track your progress through the curriculum</li>
        <li>Complete assignments and assessments</li>
      </ul>
      <p>If you have any questions or need assistance, our support team is here to help.</p>
      <p>Best regards,<br>AttenSys Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Welcome email endpoint
app.post("/api/welcome-email", async (req, res) => {
  const { email, username } = req.body;
  try {
    await sendWelcomeEmail(email, username);
    res.status(200).json({ message: "Welcome email sent successfully" });
  } catch (err) {
    console.error("Error sending welcome email:", err);
    res.status(500).json({
      message: "Failed to send welcome email",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/login-notification", async (req, res) => {
  const { email, username } = req.body;
  try {
    await sendLoginNotification(email, username);
    res.status(200).json({ message: "Login notification sent successfully" });
  } catch (err) {
    console.error("Error sending login notification:", err);
    res.status(500).json({
      message: "Failed to send login notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/course-approval-notification", async (req, res) => {
  const { email, username, courseName } = req.body;
  try {
    await sendCourseApprovalNotification(email, username, courseName);
    res
      .status(200)
      .json({ message: "Course approval notification sent successfully" });
  } catch (err) {
    console.error("Error sending course approval notification:", err);
    res.status(500).json({
      message: "Failed to send course approval notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/notify-admin-new-course", async (req, res) => {
  const { adminEmail, creatorName, courseName } = req.body;
  try {
    await notifyAdminNewCourse(adminEmail, creatorName, courseName);
    res.status(200).json({ message: "Admin notification sent successfully" });
  } catch (err) {
    console.error("Error sending admin notification:", err);
    res.status(500).json({
      message: "Failed to send admin notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.post("/api/course-creation-notification", async (req, res) => {
  const { email, username, courseName } = req.body;
  try {
    await notifyCourseCreation(email, username, courseName);
    res
      .status(200)
      .json({ message: "Course creation notification sent successfully" });
  } catch (err) {
    console.error("Error sending course creation notification:", err);
    res.status(500).json({
      message: "Failed to send course creation notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Course disapproval notification endpoint
app.post("/api/course-disapproval-notification", async (req, res) => {
  const { email, username, courseName, reason } = req.body;
  try {
    await sendCourseDisapprovalNotification(
      email,
      username,
      courseName,
      reason
    );
    res
      .status(200)
      .json({ message: "Course disapproval notification sent successfully" });
  } catch (err) {
    console.error("Error sending course disapproval notification:", err);
    res.status(500).json({
      message: "Failed to send course disapproval notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Course purchase notification endpoint
app.post("/api/course-purchase-notification", async (req, res) => {
  const { email, username, courseName, price } = req.body;
  try {
    await sendCoursePurchaseNotification(email, username, courseName, price);
    res
      .status(200)
      .json({ message: "Course purchase notification sent successfully" });
  } catch (err) {
    console.error("Error sending course purchase notification:", err);
    res.status(500).json({
      message: "Failed to send course purchase notification",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error in request:", {
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
    stack: err.stack,
  });
  res.status(500).json({
    error: "Something went wrong!",
    message: err instanceof Error ? err.message : String(err),
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

// Get all events for a specific address (personalized notifications)
app.get(
  "/api/events/address/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address } = req.params;

      console.log(`Querying events for address: ${address}`);

      // Fetch events from all tables where the address is involved
      const [
        createdCourses,
        replacedCourses,
        certClaimedCourses,
        adminTransferredEvents,
        acquiredCourses,
        removedCourses,
      ] = await Promise.all([
        // Courses created by this address
        db
          .select()
          .from(courseCreated)
          .where(eq(courseCreated.courseCreator, address)),

        // Courses replaced by this address
        db
          .select()
          .from(courseReplaced)
          .where(eq(courseReplaced.owner_, address)),

        // Certificates claimed by this address
        db
          .select()
          .from(courseCertClaimed)
          .where(eq(courseCertClaimed.candidate, address)),

        // Admin transfers to this address
        db
          .select()
          .from(adminTransferred)
          .where(eq(adminTransferred.newAdmin, address)),

        // Courses acquired by this address (as owner or candidate)
        db
          .select()
          .from(acquiredCourse)
          .where(
            sql`${acquiredCourse.owner} = ${address} OR ${acquiredCourse.candidate} = ${address}`
          ),

        // Courses removed by this address (join with courseCreated to get owner)
        db
          .select({
            courseIdentifier: courseRemoved.courseIdentifier,
            blockNumber: courseRemoved.blockNumber,
            timestamp: courseRemoved.timestamp,
          })
          .from(courseRemoved)
          .innerJoin(
            courseCreated,
            eq(courseRemoved.courseIdentifier, courseCreated.courseIdentifier)
          )
          .where(eq(courseCreated.courseCreator, address)),
      ]);

      console.log(
        `Found ${createdCourses.length + replacedCourses.length + certClaimedCourses.length + adminTransferredEvents.length + acquiredCourses.length + removedCourses.length} total events`
      );

      // Combine all events and add type information
      const allEvents = [
        ...createdCourses.map((event) => ({
          ...event,
          type: "COURSE_CREATED",
          eventType: "created",
        })),
        ...replacedCourses.map((event) => ({
          ...event,
          type: "COURSE_REPLACED",
          eventType: "replaced",
        })),
        ...certClaimedCourses.map((event) => ({
          ...event,
          type: "CERT_CLAIMED",
          eventType: "cert-claimed",
        })),
        ...adminTransferredEvents.map((event) => ({
          ...event,
          type: "ADMIN_TRANSFERRED",
          eventType: "admin-transferred",
        })),
        ...acquiredCourses.map((event) => ({
          ...event,
          type: "COURSE_ACQUIRED",
          eventType: "acquired",
        })),
        ...removedCourses.map((event) => ({
          ...event,
          type: "COURSE_REMOVED",
          eventType: "removed",
        })),
      ];

      // Process timestamps and sort by block number (newest first)
      const processedEvents = allEvents
        .map((event) => {
          const processedEvent = { ...event };
          if (processedEvent.timestamp) {
            try {
              const date = new Date(processedEvent.timestamp);
              if (!isNaN(date.getTime())) {
                processedEvent.timestamp = date.toISOString();
              }
            } catch (error) {
              console.warn(`Error processing timestamp: ${error}`);
            }
          }
          return processedEvent;
        })
        .sort((a, b) => b.blockNumber - a.blockNumber);

      res.json(processedEvents);
    } catch (error) {
      console.error("Error fetching events by address:", error);
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
