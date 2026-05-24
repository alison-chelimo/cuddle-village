const PDFDocument = require("pdfkit");
const moment = require("moment");

const NAVY  = "#2d2640";
const PURPLE = "#8b7fd4";
const LIGHT_PURPLE = "#afa7e7";
const GREY  = "#666666";
const ROW_ALT = "#faf9fe";
const MARGIN = 50;
const PAGE_W = 595;
const USABLE_W = PAGE_W - MARGIN * 2;

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function hRule(doc, y, color = LIGHT_PURPLE) {
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(color).lineWidth(0.5).stroke();
}

function fmtKsh(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

async function generateReceipt(order, user) {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const bufferPromise = streamToBuffer(doc);

  const orderId  = order._id.toString();
  const orderRef = orderId.slice(-8).toUpperCase();
  const paidDate = order.paidAt ? moment(order.paidAt).format("DD MMM YYYY") : moment().format("DD MMM YYYY");

  // ── Header ────────────────────────────────────────────────────────────────
  doc.fontSize(20).fillColor(NAVY).font("Helvetica-Bold")
    .text("The Cuddle Village", MARGIN, 55, { align: "center", width: USABLE_W });
  doc.fontSize(9).fillColor(PURPLE).font("Helvetica")
    .text("Baby  ·  Books  ·  Wellness", MARGIN, 80, { align: "center", width: USABLE_W, characterSpacing: 1.5 });

  hRule(doc, 100);

  // ── Receipt title + meta ──────────────────────────────────────────────────
  let y = 114;
  doc.fontSize(13).fillColor(NAVY).font("Helvetica-Bold")
    .text("PAYMENT RECEIPT", MARGIN, y);

  const rightX = MARGIN + USABLE_W - 160;
  doc.fontSize(9).fillColor(GREY).font("Helvetica")
    .text(`Receipt No: #${orderRef}`, rightX, y, { width: 160, align: "right" });
  doc.fontSize(9).fillColor(GREY)
    .text(`Date: ${paidDate}`, rightX, y + 14, { width: 160, align: "right" });
  if (order.paymentReference) {
    doc.fontSize(9).fillColor(GREY)
      .text(`Ref: ${order.paymentReference}`, rightX, y + 28, { width: 160, align: "right" });
  }

  y += 54;
  hRule(doc, y);
  y += 14;

  // ── Bill To / Ship To ─────────────────────────────────────────────────────
  const colW = USABLE_W / 2 - 10;
  doc.fontSize(8).fillColor(GREY).font("Helvetica")
    .text("BILL TO", MARGIN, y, { characterSpacing: 1 });
  doc.fontSize(8).fillColor(GREY)
    .text("SHIP TO", MARGIN + colW + 20, y, { characterSpacing: 1 });

  y += 14;
  doc.fontSize(10).fillColor(NAVY).font("Helvetica-Bold")
    .text(user.name || "Customer", MARGIN, y, { width: colW });
  doc.fontSize(10).fillColor(NAVY)
    .text(order.shippingAddress?.address || "", MARGIN + colW + 20, y, { width: colW });

  y += 16;
  doc.fontSize(9).fillColor(GREY).font("Helvetica")
    .text(user.email || "", MARGIN, y, { width: colW });
  doc.fontSize(9).fillColor(GREY)
    .text(order.shippingAddress?.city || "", MARGIN + colW + 20, y, { width: colW });

  if (order.shippingAddress?.phone) {
    y += 14;
    doc.fontSize(9).fillColor(GREY)
      .text(order.shippingAddress.phone, MARGIN + colW + 20, y, { width: colW });
  }

  y += 28;
  hRule(doc, y);
  y += 14;

  // ── Items table ───────────────────────────────────────────────────────────
  const COL = {
    num:   { x: MARGIN,       w: 22 },
    name:  { x: MARGIN + 22,  w: 220 },
    qty:   { x: MARGIN + 242, w: 40 },
    price: { x: MARGIN + 282, w: 90 },
    sub:   { x: MARGIN + 372, w: 123 },
  };

  // Header row
  doc.rect(MARGIN, y, USABLE_W, 20).fill(PURPLE);
  const thY = y + 5;
  doc.fontSize(8.5).fillColor("#ffffff").font("Helvetica-Bold")
    .text("#",       COL.num.x,   thY, { width: COL.num.w,   align: "center" })
    .text("Item",    COL.name.x,  thY, { width: COL.name.w,  align: "left" })
    .text("Qty",     COL.qty.x,   thY, { width: COL.qty.w,   align: "center" })
    .text("Price",   COL.price.x, thY, { width: COL.price.w, align: "right" })
    .text("Subtotal",COL.sub.x,   thY, { width: COL.sub.w,   align: "right" });

  y += 20;

  const items = order.orderItems || [];
  items.forEach((item, i) => {
    if (y > 750) { doc.addPage(); y = MARGIN; }
    const rowH = 22;
    if (i % 2 === 1) doc.rect(MARGIN, y, USABLE_W, rowH).fill(ROW_ALT);

    const rowY = y + 5;
    doc.fontSize(8.5).fillColor(GREY).font("Helvetica")
      .text(String(i + 1), COL.num.x,   rowY, { width: COL.num.w,   align: "center" })
      .text(item.name || "", COL.name.x, rowY, { width: COL.name.w,  align: "left", ellipsis: true })
      .text(String(item.qty || 1), COL.qty.x, rowY, { width: COL.qty.w, align: "center" })
      .text(fmtKsh(item.price),    COL.price.x, rowY, { width: COL.price.w, align: "right" })
      .text(fmtKsh((item.qty || 1) * (item.price || 0)), COL.sub.x, rowY, { width: COL.sub.w, align: "right" });

    hRule(doc, y + rowH, "#f0eeff");
    y += rowH;
  });

  y += 14;

  // ── Totals block ──────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, it) => s + (it.qty || 1) * (it.price || 0), 0);
  const totalsX  = MARGIN + USABLE_W - 220;
  const totalsLabelW = 140;
  const totalsValW   = 80;

  function totalRow(label, amount, bold = false, color = GREY) {
    if (y > 760) { doc.addPage(); y = MARGIN; }
    doc.fontSize(9)
      .fillColor(color)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .text(label, totalsX, y, { width: totalsLabelW, align: "left" });
    doc.fontSize(9)
      .fillColor(bold ? NAVY : color)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .text(fmtKsh(amount), totalsX + totalsLabelW, y, { width: totalsValW, align: "right" });
    y += 16;
  }

  totalRow("Subtotal", subtotal);

  if ((order.promoDiscount || 0) > 0) {
    const label = order.promoCode ? `Promo (${order.promoCode})` : "Promo Discount";
    totalRow(label, -order.promoDiscount, false, PURPLE);
  }
  if ((order.pointsDiscount || 0) > 0) {
    totalRow(`Points Redeemed (${order.pointsRedeemed || 0} pts)`, -order.pointsDiscount, false, PURPLE);
  }

  hRule(doc, y, NAVY);
  y += 8;
  totalRow("Total", order.totalPrice, true, NAVY);
  y += 6;

  // ── Loyalty banner ────────────────────────────────────────────────────────
  if ((order.pointsEarned || 0) > 0) {
    if (y > 750) { doc.addPage(); y = MARGIN; }
    doc.roundedRect(MARGIN, y, USABLE_W, 28, 8).fill("#f0eeff");
    doc.fontSize(9).fillColor(PURPLE).font("Helvetica-Bold")
      .text(
        `You earned ${order.pointsEarned} loyalty point${order.pointsEarned === 1 ? "" : "s"} on this order!`,
        MARGIN + 10, y + 9, { width: USABLE_W - 20, align: "center" }
      );
    y += 40;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = Math.max(y + 20, 780);
  hRule(doc, footerY);
  doc.fontSize(9).fillColor(GREY).font("Helvetica")
    .text("Thank you for shopping with The Cuddle Village — Nairobi, Kenya", MARGIN, footerY + 10, { align: "center", width: USABLE_W });
  if (process.env.EMAIL_USER) {
    doc.fontSize(8).fillColor(LIGHT_PURPLE)
      .text(`Questions? ${process.env.EMAIL_USER}`, MARGIN, footerY + 26, { align: "center", width: USABLE_W });
  }
  doc.fontSize(7.5).fillColor("#aaaaaa")
    .text("This is a computer-generated receipt. No signature required.", MARGIN, footerY + 40, { align: "center", width: USABLE_W });

  doc.end();
  return bufferPromise;
}

module.exports = generateReceipt;
