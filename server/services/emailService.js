const nodemailer = require("nodemailer");

/**
 * Creates a transporter. Uses real SMTP if EMAIL_USER is set,
 * otherwise falls back to Ethereal (catch-all dev inbox — OTP printed to console too).
 */
async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password (not your main password)
      },
    });
  }

  // Ethereal fallback for development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Send an OTP email. Also logs the preview URL if using Ethereal.
 */
async function sendOTPEmail(to, otp) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"TripCo ✈️" <${process.env.EMAIL_USER || "no-reply@tripco.dev"}>`,
    to,
    subject: "Your TripCo Verification Code",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 26px;">✈️</div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 14px 0 4px;">Verify your email</h1>
          <p style="color: #64748b; font-size: 14px;">Enter the code below to activate your TripCo account</p>
        </div>

        <div style="background: #fff; border-radius: 12px; padding: 28px; text-align: center; border: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Your verification code</p>
          <div style="font-size: 44px; font-weight: 900; letter-spacing: 12px; color: #7c3aed; font-family: monospace;">${otp}</div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 14px;">This code expires in <strong>10 minutes</strong></p>
        </div>

        <p style="text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 24px;">
          If you didn't create a TripCo account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

// In dev, print the Ethereal preview URL
  if (!process.env.EMAIL_USER) {
    console.log(`\n📧 OTP for ${to}: ${otp}`);
    console.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}\n`);
  }
}

/**
 * Send a Password Reset OTP email.
 */
async function sendPasswordResetEmail(to, otp) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"TripCo ✈️" <${process.env.EMAIL_USER || "no-reply@tripco.dev"}>`,
    to,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 26px;">🔒</div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 14px 0 4px;">Reset your password</h1>
          <p style="color: #64748b; font-size: 14px;">Enter the code below to reset your TripCo password</p>
        </div>

        <div style="background: #fff; border-radius: 12px; padding: 28px; text-align: center; border: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Your reset code</p>
          <div style="font-size: 44px; font-weight: 900; letter-spacing: 12px; color: #ef4444; font-family: monospace;">${otp}</div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 14px;">This code expires in <strong>10 minutes</strong></p>
        </div>

        <p style="text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 24px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  // In dev, print the Ethereal preview URL
  if (!process.env.EMAIL_USER) {
    console.log(`\n📧 Password Reset OTP for ${to}: ${otp}`);
    console.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}\n`);
  }
}

module.exports = { sendOTPEmail, sendPasswordResetEmail };
