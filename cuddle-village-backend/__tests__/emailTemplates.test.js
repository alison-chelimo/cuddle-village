const { verifyEmail, resetPasswordEmail, bookClubConfirmationEmail, orderReceiptEmail } = require("../utils/emailTemplates");

describe("verifyEmail", () => {
  it("includes the verification code in the HTML", () => {
    const html = verifyEmail("483920");
    // Each digit is rendered inside its own <span>, so check digit by digit
    for (const digit of "483920") {
      expect(html).toContain(`>${digit}<`);
    }
  });

  it("returns a complete HTML document", () => {
    const html = verifyEmail("000000");
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain("</html>");
  });

  it("mentions expiry", () => {
    const html = verifyEmail("123456");
    expect(html.toLowerCase()).toMatch(/expir|minutes/);
  });
});

describe("resetPasswordEmail", () => {
  it("includes the reset code in the HTML", () => {
    const html = resetPasswordEmail("789012");
    // Each digit is rendered inside its own <span>, so check digit by digit
    for (const digit of "789012") {
      expect(html).toContain(`>${digit}<`);
    }
  });

  it("returns a complete HTML document", () => {
    const html = resetPasswordEmail("000000");
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain("</html>");
  });

  it("contains reset text", () => {
    const html = resetPasswordEmail("000000");
    expect(html.toLowerCase()).toMatch(/reset/);
  });
});

describe("bookClubConfirmationEmail", () => {
  const child = { name: "Emma", age: 5 };
  const parent = { name: "Sarah" };
  const program = { group: "early-learners", schedule: "saturday", plan: "monthly" };

  it("includes child name", () => {
    const html = bookClubConfirmationEmail(child, parent, program);
    expect(html).toContain("Emma");
  });

  it("includes parent name", () => {
    const html = bookClubConfirmationEmail(child, parent, program);
    expect(html).toContain("Sarah");
  });

  it("includes program name", () => {
    const html = bookClubConfirmationEmail(child, parent, program);
    expect(html).toContain("Early Learners");
  });

  it("returns valid HTML", () => {
    const html = bookClubConfirmationEmail(child, parent, program);
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain("</html>");
  });
});

describe("orderReceiptEmail", () => {
  const baseOrder = {
    _id: { toString: () => "6a0ff853cb79317ce83c3480" },
    orderItems: [{ name: "Baby Toy", qty: 2, price: 1500 }],
    totalPrice: 3000,
    paymentReference: "REF-ABC-001",
    shippingAddress: { address: "123 Main St", city: "Nairobi", phone: "0700000000" },
  };
  const user = { name: "Jane Doe" };

  it("returns a complete HTML document", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain("</html>");
  });

  it("includes customer name", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toContain("Jane Doe");
  });

  it("includes order reference", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toContain("3C3480"); // last 8 chars uppercase
  });

  it("includes item name escaped", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toContain("Baby Toy");
  });

  it("escapes XSS in item name", () => {
    const xssOrder = { ...baseOrder, orderItems: [{ name: "<script>alert(1)</script>", qty: 1, price: 100 }] };
    const html = orderReceiptEmail(xssOrder, user);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes shipping address", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toContain("123 Main St");
    expect(html).toContain("Nairobi");
  });

  it("includes payment reference", () => {
    const html = orderReceiptEmail(baseOrder, user);
    expect(html).toContain("REF-ABC-001");
  });

  it("shows promo discount row when promoDiscount > 0", () => {
    const order = { ...baseOrder, promoDiscount: 500, promoCode: "SAVE500" };
    const html = orderReceiptEmail(order, user);
    expect(html).toContain("SAVE500");
  });

  it("shows loyalty points banner when pointsEarned > 0", () => {
    const order = { ...baseOrder, pointsEarned: 30 };
    const html = orderReceiptEmail(order, user);
    expect(html).toContain("30 loyalty point");
  });

  it("renders without optional fields gracefully", () => {
    const minimalOrder = {
      _id: { toString: () => "000000000000000000000001" },
      orderItems: [],
      totalPrice: 0,
    };
    const html = orderReceiptEmail(minimalOrder, { name: "" });
    expect(html).toMatch(/<!DOCTYPE html>/i);
  });

  it("uses paidAt date when present", () => {
    const order = { ...baseOrder, paidAt: new Date("2025-01-15").toISOString() };
    const html = orderReceiptEmail(order, user);
    expect(html).toContain("2025");
  });
});
