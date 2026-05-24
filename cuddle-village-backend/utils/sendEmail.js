const nodemailer = require("nodemailer");
const { verifyEmail, orderReceiptEmail } = require("./emailTemplates");
const generateReceipt = require("./generateReceipt");
const Order = require("../models/Order");

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

// Send post-payment receipt email with PDF attachment
const sendReceiptEmail = async (orderId) => {
  try {
    // Atomic claim — only the first caller proceeds; concurrent calls are no-ops
    const claimed = await Order.findOneAndUpdate(
      { _id: orderId, receiptSent: false },
      { receiptSent: true },
      { new: false }
    ).populate("user", "name email");

    if (!claimed) {
      console.log("Receipt email already sent or order not found for", orderId);
      return;
    }

    const order = claimed;
    const user = order.user;
    if (!user?.email) {
      console.warn("Receipt email: no user email for order", orderId);
      // Roll back the claim so a future retry can attempt after user data is fixed
      await Order.findByIdAndUpdate(orderId, { receiptSent: false });
      return;
    }

    const pdfBuffer = await generateReceipt(order, user);
    const html = orderReceiptEmail(order, user);
    const orderRef = order._id.toString().slice(-8).toUpperCase();

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"The Cuddle Village" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your Cuddle Village receipt — Order #${orderRef}`,
      html,
      attachments: [
        {
          filename: `receipt-${orderRef}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Receipt email sent:", info.messageId, "| order:", orderRef);
  } catch (err) {
    console.error("Receipt email error:", err.message);
  }
};

module.exports = sendEmail;
module.exports.createTransporter = createTransporter;
module.exports.sendReceiptEmail = sendReceiptEmail;
