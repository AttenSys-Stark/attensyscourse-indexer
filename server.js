const express = require('express');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const cors = require('cors');
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

// Generate QR code and save it as an image file
async function generateQRCode(data, filePath) {
  try {
    await QRCode.toFile(filePath, data); // Save QR code as an image file
    return filePath;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// Upload QR code image to Cloudinary
async function uploadQRCodeToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url; // Publicly accessible URL of the uploaded image
  } catch (err) {
    console.error('Error uploading QR code to Cloudinary:', err);
    throw err;
  }
}

// Send email with QR code
async function sendEmailWithQRCode(email, qrCodeImageUrl,email, walletAddress, id, eventName ) {
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
      <h1>Thank you for registering for ${eventName}! We're excited to have you join us.!</h1>
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
  const { email, walletAddress, id, eventName} = req.body;

  try {
    // Generate QR code and save it as an image file
    const qrCodeFilePath = `./qrcodes/${Date.now()}.png`; // Save QR code in a "qrcodes" folder
    await generateQRCode(`http://www.attensys.xyz/approve/?id=${id}&user=${walletAddress}`, qrCodeFilePath);

    // Upload QR code image to Cloudinary
    const qrCodeImageUrl = await uploadQRCodeToCloudinary(qrCodeFilePath);

    // Send email with the QR code
    await sendEmailWithQRCode(email, qrCodeImageUrl,email, walletAddress, id, eventName );

    // Delete the local QR code file after uploading
    fs.unlinkSync(qrCodeFilePath);

    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});