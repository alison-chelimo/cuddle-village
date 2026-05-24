const year = new Date().getFullYear();

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Shared wrapper — table-based for maximum email client compatibility
function wrap(headerAccent, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:480px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(45,38,64,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:#2d2640;padding:36px 40px;text-align:center;">
              <div style="font-size:38px;line-height:1;margin-bottom:10px;">🧸</div>
              <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">The Cuddle Village</div>
              <div style="color:#afa7e7;font-size:11px;margin-top:6px;letter-spacing:2.5px;text-transform:uppercase;">Baby · Books · Wellness</div>
              ${headerAccent ? `<div style="display:inline-block;margin-top:14px;background:rgba(175,167,231,0.18);border:1px solid rgba(175,167,231,0.35);border-radius:20px;padding:5px 16px;color:#C3B1E1;font-size:12px;font-weight:600;">${headerAccent}</div>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf9fe;border-top:2px solid #f0eeff;padding:20px 40px;text-align:center;">
              <p style="font-size:12px;color:#bbb;margin:0 0 4px;">© ${year} The Cuddle Village Inc. · Nairobi, Kenya</p>
              <p style="font-size:12px;color:#ccc;margin:0;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reusable OTP block
function otpBlock(code) {
  const digits = String(code).split("");
  const boxes = digits.map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;margin:0 4px;background:#f5f3ff;border:2px solid #e0d9f7;border-radius:10px;font-size:28px;font-weight:900;color:#2d2640;text-align:center;font-family:'Courier New',monospace;">${d}</span>`
  ).join("");
  return `<div style="text-align:center;margin:28px 0;">${boxes}</div>`;
}

// ── Verification email ────────────────────────────────────────────────────────
function verifyEmail(code) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#2d2640;">Verify your account</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
      Thanks for signing up! Enter the code below to activate your account.
      It expires in <strong>10 minutes</strong>.
    </p>
    ${otpBlock(code)}
    <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;line-height:1.5;">
      Open the verification page and enter this code to continue.
    </p>`;
  return wrap("Email Verification", body);
}

// ── Password reset email ──────────────────────────────────────────────────────
function resetPasswordEmail(code) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#2d2640;">Reset your password</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
      We received a request to reset your password. Enter the code below
      together with your new password. It expires in <strong>10 minutes</strong>.
    </p>
    ${otpBlock(code)}
    <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;line-height:1.5;">
      If you didn't request a password reset, no action is needed — your account is safe.
    </p>`;
  return wrap("Password Reset", body);
}

// ── Book Club confirmation email ──────────────────────────────────────────────
function bookClubConfirmationEmail(child, parent, program) {
  const GROUP_LABELS = {
    "early-learners":  { label: "Early Learners", age: "Ages 4–5", color: "#b8860b", bg: "#fffbeb" },
    "growing-readers": { label: "Growing Readers", age: "Ages 6–8", color: "#1a6fa8", bg: "#eff8ff" },
  };
  const SCHEDULE_TIMES = {
    saturday: "Saturday · 10:00 – 11:00 AM",
    sunday:   "Sunday · 11:00 AM – 12:00 PM",
  };
  const PLAN_LABELS = {
    "per-session": "Per Session (KSh 800)",
    "monthly":     "Monthly (KSh 3,000)",
    "premium":     "Premium Package",
  };

  const grp      = GROUP_LABELS[program.group] || { label: program.group, age: "", color: "#8b7fd4", bg: "#f0eeff" };
  const schedule = SCHEDULE_TIMES[program.schedule] || program.schedule;
  const plan     = PLAN_LABELS[program.plan]         || program.plan;

  function detailRow(icon, label, value) {
    return `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0eeff;font-size:13px;color:#888;font-weight:600;width:36px;">${icon}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0eeff;font-size:13px;color:#888;font-weight:600;">${label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0eeff;font-size:13px;color:#2d2640;font-weight:800;">${value}</td>
    </tr>`;
  }

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#2d2640;">You're enrolled! 🎉</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
      Hi <strong>${parent.name}</strong>, <strong>${child.name}</strong> has been successfully registered
      for The Cuddle Village Book Club.
    </p>

    <!-- Group badge -->
    <div style="display:inline-block;margin-bottom:24px;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:800;background:${grp.bg};color:${grp.color};">
      ${grp.label} · ${grp.age}
    </div>

    <!-- Details card -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f5f3ff;border-radius:12px;overflow:hidden;margin-bottom:28px;">
      ${detailRow("👤", "Child",    child.name)}
      ${detailRow("📅", "Schedule", schedule)}
      ${detailRow("📋", "Plan",     plan)}
    </table>

    <!-- What to expect -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:#2d2640;">What to expect next</h3>
    <ul style="margin:0 0 24px;padding-left:20px;color:#666;font-size:14px;line-height:1.8;">
      <li>We'll be in touch with your first session date and venue details.</li>
      <li>Please arrive 10 minutes early for the first session.</li>
      <li>Bring a water bottle and any snacks your child may need.</li>
      <li>Sessions last 60 minutes — parents are welcome to stay or return at pick-up.</li>
    </ul>

    <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
      Questions? Reply to this email or contact us at
      <a href="mailto:${process.env.EMAIL_USER}" style="color:#afa7e7;font-weight:700;">${process.env.EMAIL_USER}</a>.
    </p>`;

  return wrap("Book Club Confirmed ✓", body);
}

// ── Order receipt email ───────────────────────────────────────────────────────
function orderReceiptEmail(order, user) {
  const orderRef = order._id.toString().slice(-8).toUpperCase();
  const paidDate = order.paidAt
    ? new Date(order.paidAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

  const items = (order.orderItems || []).map((item, i) => `
    <tr style="background:${i % 2 === 1 ? "#faf9fe" : "#ffffff"};">
      <td style="padding:10px 12px;font-size:13px;color:#2d2640;font-weight:600;border-bottom:1px solid #f0eeff;">${escHtml(item.name)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#666;text-align:center;border-bottom:1px solid #f0eeff;">${item.qty || 1}</td>
      <td style="padding:10px 12px;font-size:13px;color:#666;text-align:right;border-bottom:1px solid #f0eeff;">KSh ${Number(item.price || 0).toLocaleString("en-KE")}</td>
      <td style="padding:10px 12px;font-size:13px;color:#2d2640;font-weight:700;text-align:right;border-bottom:1px solid #f0eeff;">KSh ${Number((item.qty || 1) * (item.price || 0)).toLocaleString("en-KE")}</td>
    </tr>`).join("");

  const subtotal = (order.orderItems || []).reduce((s, it) => s + (it.qty || 1) * (it.price || 0), 0);

  let discountRows = "";
  if ((order.promoDiscount || 0) > 0) {
    const label = order.promoCode ? `Promo (${escHtml(order.promoCode)})` : "Promo Discount";
    discountRows += `<tr><td style="padding:4px 0;font-size:13px;color:#8b7fd4;">${label}</td><td style="padding:4px 0;font-size:13px;color:#8b7fd4;text-align:right;">−KSh ${Number(order.promoDiscount).toLocaleString("en-KE")}</td></tr>`;
  }
  if ((order.pointsDiscount || 0) > 0) {
    discountRows += `<tr><td style="padding:4px 0;font-size:13px;color:#8b7fd4;">Points Redeemed (${order.pointsRedeemed || 0} pts)</td><td style="padding:4px 0;font-size:13px;color:#8b7fd4;text-align:right;">−KSh ${Number(order.pointsDiscount).toLocaleString("en-KE")}</td></tr>`;
  }

  const loyaltyBanner = (order.pointsEarned || 0) > 0
    ? `<div style="margin-top:20px;background:#f0eeff;border-radius:10px;padding:12px 16px;text-align:center;font-size:13px;color:#8b7fd4;font-weight:700;">
        You earned ${order.pointsEarned} loyalty point${order.pointsEarned === 1 ? "" : "s"} on this order!
       </div>`
    : "";

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#2d2640;">Thank you, ${escHtml(user.name || "Customer")}!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
      Your payment was successful. A PDF copy of your receipt is attached to this email.
    </p>

    <!-- Order summary card -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f5f3ff;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:12px;color:#888;font-weight:600;padding-bottom:4px;">ORDER NUMBER</td>
        <td style="font-size:12px;color:#888;font-weight:600;text-align:right;padding-bottom:4px;">DATE</td>
      </tr>
      <tr>
        <td style="font-size:16px;color:#2d2640;font-weight:800;">#${orderRef}</td>
        <td style="font-size:14px;color:#2d2640;font-weight:700;text-align:right;">${paidDate}</td>
      </tr>
      ${order.paymentReference ? `<tr><td colspan="2" style="font-size:11px;color:#aaa;padding-top:8px;">Ref: ${escHtml(order.paymentReference)}</td></tr>` : ""}
    </table>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#2d2640;">
          <th style="padding:10px 12px;font-size:12px;color:#ffffff;font-weight:700;text-align:left;">Item</th>
          <th style="padding:10px 12px;font-size:12px;color:#ffffff;font-weight:700;text-align:center;">Qty</th>
          <th style="padding:10px 12px;font-size:12px;color:#ffffff;font-weight:700;text-align:right;">Price</th>
          <th style="padding:10px 12px;font-size:12px;color:#ffffff;font-weight:700;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#666;">Subtotal</td><td style="padding:4px 0;font-size:13px;color:#666;text-align:right;">KSh ${Number(subtotal).toLocaleString("en-KE")}</td></tr>
      ${discountRows}
      <tr><td colspan="2" style="border-top:2px solid #2d2640;padding-top:8px;"></td></tr>
      <tr>
        <td style="padding-top:4px;font-size:15px;color:#2d2640;font-weight:800;">Total</td>
        <td style="padding-top:4px;font-size:15px;color:#2d2640;font-weight:800;text-align:right;">KSh ${Number(order.totalPrice || 0).toLocaleString("en-KE")}</td>
      </tr>
    </table>

    ${loyaltyBanner}

    <!-- Shipping address -->
    ${order.shippingAddress ? `
    <div style="margin-top:24px;padding:14px 16px;border:1px solid #f0eeff;border-radius:10px;">
      <div style="font-size:11px;color:#aaa;font-weight:600;letter-spacing:1px;margin-bottom:6px;">SHIPPING TO</div>
      <div style="font-size:13px;color:#2d2640;font-weight:700;">${escHtml(order.shippingAddress.address)}</div>
      <div style="font-size:13px;color:#666;">${escHtml(order.shippingAddress.city)}</div>
      <div style="font-size:13px;color:#666;">${escHtml(order.shippingAddress.phone)}</div>
    </div>` : ""}

    <p style="margin:24px 0 0;font-size:13px;color:#999;line-height:1.6;">
      Questions? Contact us at
      <a href="mailto:${process.env.EMAIL_USER}" style="color:#8b7fd4;font-weight:700;">${process.env.EMAIL_USER}</a>.
    </p>`;

  return wrap("Payment Confirmed ✓", body);
}

module.exports = { verifyEmail, resetPasswordEmail, bookClubConfirmationEmail, orderReceiptEmail };
