const express = require('express');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();


const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create an HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const meetings = {};
const users = {};

const sessions = {};

io.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register-laptop') {
      // Laptop registers with a session ID
      sessions[data.sessionId] = { laptop: ws, phone: null };
      console.log(`Laptop registered for session: ${data.sessionId}`);
    } else if (data.type === 'register-phone') {
      // Phone registers with a session ID
      if (sessions[data.sessionId]) {
        sessions[data.sessionId].phone = ws;
        console.log(`Phone registered for session: ${data.sessionId}`);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid session ID' }));
      }
    } else if (data.type === 'scan') {
      // Forward scanned data from phone to laptop
      const session = sessions[data.sessionId];
      if (session && session.laptop) {
        session.laptop.send(JSON.stringify({ type: 'action', data: data.scannedData }));
        console.log(`Scanned data forwarded to laptop for session: ${data.sessionId}`);
      }
    }
  });
});

// Generate QR code as a data URL
async function generateQRCode(eventId, attendeeaddress) {
  const qrCodeData = JSON.stringify({
    eventId,
    attendeeaddress
  });
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData); // Generate QR code as a data URL
    return qrCodeDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// Upload QR code image to Cloudinary
async function uploadQRCodeToCloudinary(dataUrl) {
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      resource_type: 'image',
    });
    return result.secure_url; // Publicly accessible URL of the uploaded image
  } catch (err) {
    console.error('Error uploading QR code to Cloudinary:', err);
    throw err;
  }
}

// Send email with QR code
async function sendEmailWithQRCode(email, qrCodeImageUrl, walletAddress, id, eventName) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
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

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { email, walletAddress, id, eventName } = req.body;

  try {
    // Generate QR code as a data URL
    const qrCodeDataUrl = await generateQRCode(id, walletAddress);

    // Upload QR code image to Cloudinary
    const qrCodeImageUrl = await uploadQRCodeToCloudinary(qrCodeDataUrl);

    // Send email with the QR code
    await sendEmailWithQRCode(email, qrCodeImageUrl, walletAddress, id, eventName);

    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Generate a master QR code for the laptop frontend
app.get('/api/generate-master-qr', async (req, res) => {
  const sessionId = Math.random().toString(36).substring(7); // Generate a unique session ID
  const qrCodeData = JSON.stringify({
    sessionId,
    wsUrl: 'wss://attensys-1a184d8bebe7.herokuapp.com', // Replace with your WebSocket server URL
  });

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
    res.status(200).json({ qrCodeDataUrl, sessionId });
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
  }
});

// Email notification functions
async function sendWelcomeEmail(email, username) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to AttenSys!',
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

async function sendLoginNotification(email, username) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Login to Your AttenSys Account',
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

async function sendCourseApprovalNotification(email, username, courseName) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Course Has Been Approved!',
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

async function notifyAdminNewCourse(adminEmail, creatorName, courseName) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New Course Created - Requires Approval',
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

async function notifyCourseCreation(email, username, courseName) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Course Creation Confirmation',
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

async function sendCourseDisapprovalNotification(email, username, courseName, reason) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Course Review Update',
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

async function sendCoursePurchaseNotification(email, username, courseName, price) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Course Purchase Confirmation',
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
app.post('/api/welcome-email', async (req, res) => {
  const { email, username } = req.body;
  try {
    await sendWelcomeEmail(email, username);
    res.status(200).json({ message: 'Welcome email sent successfully' });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    res.status(500).json({ message: 'Failed to send welcome email', error: err.message });
  }
});

app.post('/api/login-notification', async (req, res) => {
  const { email, username } = req.body;
  try {
    await sendLoginNotification(email, username);
    res.status(200).json({ message: 'Login notification sent successfully' });
  } catch (err) {
    console.error('Error sending login notification:', err);
    res.status(500).json({ message: 'Failed to send login notification', error: err.message });
  }
});

app.post('/api/course-approval-notification', async (req, res) => {
  const { email, username, courseName } = req.body;
  try {
    await sendCourseApprovalNotification(email, username, courseName);
    res.status(200).json({ message: 'Course approval notification sent successfully' });
  } catch (err) {
    console.error('Error sending course approval notification:', err);
    res.status(500).json({ message: 'Failed to send course approval notification', error: err.message });
  }
});

app.post('/api/notify-admin-new-course', async (req, res) => {
  const { adminEmail, creatorName, courseName } = req.body;
  try {
    await notifyAdminNewCourse(adminEmail, creatorName, courseName);
    res.status(200).json({ message: 'Admin notification sent successfully' });
  } catch (err) {
    console.error('Error sending admin notification:', err);
    res.status(500).json({ message: 'Failed to send admin notification', error: err.message });
  }
});

app.post('/api/course-creation-notification', async (req, res) => {
  const { email, username, courseName } = req.body;
  try {
    await notifyCourseCreation(email, username, courseName);
    res.status(200).json({ message: 'Course creation notification sent successfully' });
  } catch (err) {
    console.error('Error sending course creation notification:', err);
    res.status(500).json({ message: 'Failed to send course creation notification', error: err.message });
  }
});

// Course disapproval notification endpoint
app.post('/api/course-disapproval-notification', async (req, res) => {
  const { email, username, courseName, reason } = req.body;
  try {
    await sendCourseDisapprovalNotification(email, username, courseName, reason);
    res.status(200).json({ message: 'Course disapproval notification sent successfully' });
  } catch (err) {
    console.error('Error sending course disapproval notification:', err);
    res.status(500).json({ message: 'Failed to send course disapproval notification', error: err.message });
  }
});

// Course purchase notification endpoint
app.post('/api/course-purchase-notification', async (req, res) => {
  const { email, username, courseName, price } = req.body;
  try {
    await sendCoursePurchaseNotification(email, username, courseName, price);
    res.status(200).json({ message: 'Course purchase notification sent successfully' });
  } catch (err) {
    console.error('Error sending course purchase notification:', err);
    res.status(500).json({ message: 'Failed to send course purchase notification', error: err.message });
  }
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});