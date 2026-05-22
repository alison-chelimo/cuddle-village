const nodemailer = require("nodemailer");
const { verifyEmail } = require("./emailTemplates");

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Send email verification OTP
const sendEmail = async (to, code) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"The Cuddle Village" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your verification code — The Cuddle Village",
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    html: verifyEmail(code),
  });
  console.log("Verification email sent:", info.messageId);
};

module.exports = sendEmail;
module.exports.createTransporter = createTransporter;
