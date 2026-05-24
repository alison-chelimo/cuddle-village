const { verifyEmail, resetPasswordEmail, bookClubConfirmationEmail } = require("../utils/emailTemplates");

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
