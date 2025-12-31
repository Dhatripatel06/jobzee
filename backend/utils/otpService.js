import nodemailer from "nodemailer";
import twilio from "twilio";

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
};

// Send OTP via Email
export const sendOTPEmail = async (email, otp, type) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log(`\n📧 EMAIL OTP for ${email}: ${otp} (${type})`);
      console.log(`⏱️  Valid for 10 minutes\n`);
      return { success: true, mock: true, otp }; // Mock for development
    }

    const transporter = createEmailTransporter();
    
    const subject = type === "login" 
      ? "Your Login OTP for Jobzee" 
      : "Password Reset OTP for Jobzee";
    
    const message = type === "login"
      ? `Your OTP for login is: ${otp}. This OTP is valid for 10 minutes.`
      : `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Jobzee - ${type === "login" ? "Login" : "Password Reset"} OTP</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">${message}</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #4CAF50; margin: 0; text-align: center; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #777;">If you didn't request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #777;">Best regards,<br>Jobzee Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP via SMS (Twilio)
export const sendOTPSMS = async (phone, otp, type) => {
  try {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || 
        !process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_ACCOUNT_SID === 'your-twilio-account-sid') {
      console.log(`\n📱 SMS OTP for ${phone}: ${otp} (${type})`);
      console.log(`⏱️  Valid for 10 minutes\n`);
      return { success: true, mock: true, otp }; // Mock for development
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = type === "login"
      ? `Your Jobzee login OTP is: ${otp}. Valid for 10 minutes.`
      : `Your Jobzee password reset OTP is: ${otp}. Valid for 10 minutes.`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+${phone}`, // Ensure phone number includes country code
    });

    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("Error sending OTP SMS:", error);
    return { success: false, error: error.message };
  }
};

// Validate OTP format
export const validateOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

// Check if OTP is expired
export const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};
