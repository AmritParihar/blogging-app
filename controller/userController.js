const { transporter, generateOTP } = require("./mailler/mailler");
const User = require("../DB connection/Models/UserModel");
const UserDetails = require("../DB connection/Models/userDetails");
const OTP = require("../DB connection/Models/otpModel");
const bcrypt = require("bcrypt");
const State = require("../DB connection/Models/state");
const City = require("../DB connection/Models/city");
const jwt = require("jsonwebtoken");
const Role = require("../DB connection/Models/Role");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const path = require("path");
const fs = require("fs");

// Function to generate Terms and Conditions PDF
async function generateTermsAndConditionsPDF(user) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Load the built-in Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // A4 size dimensions in points (width, height)
    const page = pdfDoc.addPage([595.28, 841.89]); // A4: 595.28 x 841.89 points
    const { height, width } = page.getSize();

    // Set default font size and color
    const fontSize = 12;
    const color = rgb(0, 0, 0);

    // Define the vertical position starting point
    let yPos = height - 50;

    // Title: Terms and Conditions
    page.drawText("Terms and Conditions", {
      x: 50,
      y: yPos,
      size: 24, // Larger font size for title
      color: rgb(0.2, 0.4, 0.6), // Darker blue for the title
      font: helveticaFont,
    });

    // Move yPos down for the next section
    yPos -= 50;

    // User information section
    page.drawText(`Name: ${user.firstName} ${user.lastName}`, {
      x: 50,
      y: yPos,
      size: 14,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });
    yPos -= 20; // Adjust space
    page.drawText(`Email: ${user.email}`, {
      x: 50,
      y: yPos,
      size: 14,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    // Add a line separator
    yPos -= 20;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Terms and Conditions content sections
    yPos -= 30;
    page.drawText("1. Introduction", {
      x: 50,
      y: yPos,
      size: 16,
      color: rgb(0.2, 0.4, 0.6),
      font: helveticaFont,
    });
    yPos -= 20;
    page.drawText(
      "This section covers the basic terms for using the Blogging Platform. By registering, you agree to the terms outlined below.",
      {
        x: 50,
        y: yPos,
        size: 12,
        color: rgb(0, 0, 0),
        font: helveticaFont,
        maxWidth: width - 100, // Ensures content doesn't overflow
      }
    );

    // Next section: Use of Service
    yPos -= 40;
    page.drawText("2. Use of Service", {
      x: 50,
      y: yPos,
      size: 16,
      color: rgb(0.2, 0.4, 0.6),
      font: helveticaFont,
    });
    yPos -= 20;
    page.drawText(
      "The Blogging Platform is for personal use only. You must not use it for illegal activities, harassment, or spamming.",
      {
        x: 50,
        y: yPos,
        size: 12,
        color: rgb(0, 0, 0),
        font: helveticaFont,
        maxWidth: width - 100,
      }
    );

    // Next section: User Responsibilities
    yPos -= 40;
    page.drawText("3. User Responsibilities", {
      x: 50,
      y: yPos,
      size: 16,
      color: rgb(0.2, 0.4, 0.6),
      font: helveticaFont,
    });
    yPos -= 20;
    page.drawText(
      "You are responsible for keeping your account information secure and for any actions taken using your account.",
      {
        x: 50,
        y: yPos,
        size: 12,
        color: rgb(0, 0, 0),
        font: helveticaFont,
        maxWidth: width - 100,
      }
    );

    // Next section: Termination
    yPos -= 40;
    page.drawText("4. Termination", {
      x: 50,
      y: yPos,
      size: 16,
      color: rgb(0.2, 0.4, 0.6),
      font: helveticaFont,
    });
    yPos -= 20;
    page.drawText(
      "We reserve the right to terminate your account if you violate any of the terms mentioned above.",
      {
        x: 50,
        y: yPos,
        size: 12,
        color: rgb(0, 0, 0),
        font: helveticaFont,
        maxWidth: width - 100,
      }
    );

    // Footer with generation date
    yPos -= 60;
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 50, // Footer at the bottom of the page
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
      font: helveticaFont,
    });

    // Save the PDF document to a buffer
    const pdfBytes = await pdfDoc.save();

    // Define the directory and file path
    const directoryPath = path.join("../PDF");
    const filePath = path.join(directoryPath, "terms-and-conditions.pdf");

    // Check if the directory exists; if not, create it
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Save the PDF buffer to a file
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

// Register Blogger function
const RegisterBlogger = async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    city,
    state,
    zipCode,
    contact,
    termsAccepted,
  } = req.body;

  if (!termsAccepted) {
    return res
      .status(400)
      .json({
        error: "Please accept the terms and conditions before registering.",
      });
  }

  try {
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const role = await Role.findOne({ where: { id: 2 } });
    if (!role) {
      return res.status(500).json({ error: "Default role not found" });
    }

    // Create a new user and user details
    const newUser = await User.create({ email, roleId: role.id });
    await UserDetails.create({
      userId: newUser.id,
      firstName,
      lastName,
      city,
      state,
      zipCode,
      contact,
    });

    // Generate OTP and save
    const otp = generateOTP();
    await OTP.create({
      userId: newUser.id,
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
    });

    // Send OTP email
    const otpEmailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Welcome to Blogging Platform!</h2>
      <hr style="border-top: 1px solid #ddd;">
      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
      <p>Thank you for registering with us! We are thrilled to have you on board. To complete your registration, please use the following OTP (One-Time Password):</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; font-size: 24px; border-radius: 5px; letter-spacing: 2px;">${otp}</span>
      </div>
      <p style="color: #888;">This OTP is valid for the next <strong>15 minutes</strong>. Please make sure to complete your registration within this time period.</p>
      <p>If you did not initiate this registration or believe this email was sent in error, please ignore this message or contact our support team for assistance.</p>
      <hr style="border-top: 1px solid #ddd;">
      <p style="font-size: 14px; color: #888; text-align: center;">Best regards,<br>The Blogging Platform Team</p>
      <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Blogging Platform. All rights reserved.</p>
    </div>
  `;

    // Send OTP email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Complete Your Registration with OTP",
      html: otpEmailTemplate,
    });

    // Generate the Terms and Conditions PDF
    const pdfPath = await generateTermsAndConditionsPDF({
      firstName,
      lastName,
      email,
    });

    // Send terms and conditions email with PDF attachment
    const tcHtmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #4CAF50; text-align: center;">Terms and Conditions - Blogging Platform</h2>
    <hr style="border-top: 1px solid #ddd;">
    <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
    <p>Thank you for registering with Blogging Platform. Attached to this email, you will find the Terms and Conditions for using our services. Please review them carefully.</p>
    <p>If you have any questions or concerns, feel free to reach out to our support team at any time.</p>
    <p style="color: #888;">We appreciate your trust in our platform, and we are excited to have you as a part of our community.</p>
    <hr style="border-top: 1px solid #ddd;">
    <p style="font-size: 14px; color: #888; text-align: center;">Best regards,<br>The Blogging Platform Team</p>
    <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Blogging Platform. All rights reserved.</p>
  </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Terms and Conditions for Blogging Platform",
      html: tcHtmlTemplate,
      attachments: [
        {
          filename: "Terms_and_Conditions.pdf",
          path: pdfPath,
        },
      ],
    });

    return res.status(201).json({
      message:
        "Blogger registered successfully. Check your email for the OTP and Terms and Conditions.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get States -==-=->>>>

const getStates = async (req, res) => {
  try {
    const states = await State.findAll({ attributes: ["id", "state", "code"] });
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
};

// Get Cities by State -==-=->>>

const getCitiesByState = async (req, res) => {
  const { stateId } = req.params;
  console.log("req.patams-=-==>>", req.params);
  try {
    console.log("stateID==-=-=->>>>", stateId);
    const cities = await City.findAll({
      where: { stateId },
      attributes: ["id", "city", "code"],
    });
    console.log("cities -==-=->>>", cities);
    res.status(200).json(cities);
  } catch (error) {
    console.log("error to getting a citry =-=-=-=-=->>>>", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};

// OTP verification
const VerifyOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ where: { otp } });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const currentTime = new Date();
    const otpCreationTime = otpRecord.createdAt;
    const expiryTime = new Date(otpCreationTime.getTime() + 30 * 60 * 1000); // OTP valid for 30 minutes

    if (currentTime > expiryTime) {
      return res.status(400).json({ error: "Expired OTP" });
    }

    const user = await User.findByPk(otpRecord.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // OTP is valid, proceed to password reset
    return res.status(200).json({
      message: "OTP verified successfully.",
      userId: user.id, // Include userId in the response
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// setNewPassword =-=->>>

const setNewPassword = async (req, res) => {
  const { userId, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    // Find OTP record by userId instead of otp field, as userId is more reliable
    const otpRecord = await OTP.findOne({ where: { userId } });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Invalid request. No OTP record found for this user." });
    }
//salt
const saltRounds = 10;
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    await User.update({ password: hashedPassword }, { where: { id: userId } });

    // Optionally delete OTP records after password reset to prevent reuse
    await OTP.destroy({ where: { userId } });

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

//find Account for forgot password
const FindAccForForgotPass = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user with the provided email
    const user = await User.findOne({ where: { email } });
    console.log("user=-=--=>>>",user)

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "Blogger not found" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create OTP record in the database
    await OTP.create({
      userId: user.id, // Use user.id instead of newUser.id
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
    });

    // HTML email template for OTP verification
    const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #ff4d4d; text-align: center;">Password Reset Request</h2>
    <hr style="border-top: 1px solid #ddd;">
    <p>Hello <strong>${user.email}</strong>,</p>
    <p>We received a request to reset the password for your account.</p>
    <p>Please use the following OTP (One-Time Password) to reset your password:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; background-color: #ff4d4d; color: white; padding: 10px 20px; font-size: 24px; border-radius: 5px; letter-spacing: 2px;">${otp}</span>
    </div>
    <p style="color: #888;">This OTP is valid for the next <strong>15 minutes</strong>. Please make sure to reset your password within this time period.</p>
    <p>If you did not request a password reset, please disregard this email or contact our support team.</p>
    <hr style="border-top: 1px solid #ddd;">
    <p style="font-size: 14px; color: #888; text-align: center;">Best regards,<br>The Blogging Platform Team</p>
    <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Blogging Platform. All rights reserved.</p>
  </div>
`;

    // Send the email
    await transporter.sendMail({
      from: process.env.G_FROM,
      to: email,
      subject: "Password Reset OTP - Blogging Platform",
      html: htmlTemplate,
    });

    // Return success response
    return res
      .status(200)
      .json({ message: "OTP sent to your email successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

// login
const LoginBlogger = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token based on the user role
    let token;
    if (user.role_id === 2) {
      // Blogger role
      token = jwt.sign(
        { userId: user.id, role: "Blogger" },
        process.env.BLOGGER_SECRET_KEY
      );
    } else if (user.role_id === 1) {
      // Admin role
      token = jwt.sign(
        { userId: user.id, role: "Admin" },
        process.env.ADMIN_SECRET_KEY
      );
    } else {
      return res.status(401).json({ error: "Unauthorized user role" });
    }
    console.log("loginJS token generated token =-=--= -=-==-=->>>>", token);

    // Set the JWT token in a cookie (with options for security)
    res.cookie("authToken", token, {
      httpOnly: false, // Allow JavaScript access (for development only)
      secure: false,   // Set to true when using HTTPS
      sameSite: 'Lax', // Prevent CSRF issues
      maxAge: 86400000 // 1 day
  });
console.log("res.cookie =-=-=-=->>>",res.cookie)
    // Return the token and success message
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ error: "Server error, please try again later." });
  }
};

// logout function

const logoutBlogger = (req, res) => {
  res.clearCookie("authToken"); // Clear the cookie
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  RegisterBlogger,
  VerifyOTP,
  FindAccForForgotPass,
  LoginBlogger,
  setNewPassword,
  getCitiesByState,
  getStates,
  logoutBlogger,
};
