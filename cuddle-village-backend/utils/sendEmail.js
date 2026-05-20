const nodemailer = require("nodemailer");

const sendEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.verify((err, success) =>{
    if(err)console.log("SMTP error:", err);
    else console.log("SMTP ready");
  });

  const info = await transporter.sendMail({
    from: `"The cuddle village" <${process.env.EMAIL_USER}>`, 
    to,
    subject: "Verify your account",
    text: `Your verification code is: ${code}`,
    html: `
    <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
        <h2 style="color: #afa7e7;">The Cuddle Village 🧸</h2>
        <p>Thanks for registering! Use the code below to verify your account:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d2640; padding: 20px; background: #f0edff; border-radius: 10px; text-align: center;">
          ${code}
        </div>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes. If you didn't register, ignore this email.</p>
      </div>
    `
  });
  console.log("Email sent:", info.messageId);
};

module.exports = sendEmail;