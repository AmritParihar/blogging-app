const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
require('dotenv').config();

// Create a nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.G_FROM,
    pass: process.env.G_PASS,
  },
});

// Generate OTP
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: 'numeric'
  });
}

module.exports = { transporter, generateOTP };
