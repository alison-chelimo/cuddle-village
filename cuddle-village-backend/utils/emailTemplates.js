const year = new Date().getFullYear();

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

module.exports = { verifyEmail, resetPasswordEmail };
