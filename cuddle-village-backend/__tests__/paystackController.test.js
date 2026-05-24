jest.mock("axios");
jest.mock("../models/Order");
jest.mock("../utils/loyaltyHelper");

const axios   = require("axios");
const crypto  = require("crypto");
const request = require("supertest");
const express = require("express");
const Order   = require("../models/Order");
const { awardLoyaltyPoints } = require("../utils/loyaltyHelper");
const controller = require("../controllers/paystackController");

const SECRET = process.env.PAYSTACK_SECRET_KEY;

// Build a minimal Express app using the controller directly
function makeApp() {
  const app = express();
  app.use(express.json());
  app.post("/initialize", controller.initializePayment);
  app.get("/verify/:reference", controller.verifyPayment); // codeql[js/missing-rate-limiting] - test harness only; production route uses paystackLimiter
  app.post("/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
    // supertest sends JSON — re-stringify for HMAC consistency in tests
    if (Buffer.isBuffer(req.body)) req.body = JSON.parse(req.body.toString());
    next();
  }, controller.webhook); // codeql[js/missing-rate-limiting] - test harness only; production route uses paystackLimiter
  return app;
}

function signPayload(payload) {
  return crypto.createHmac("sha512", SECRET).update(JSON.stringify(payload)).digest("hex");
}

let app;
beforeAll(() => { app = makeApp(); });
beforeEach(() => { jest.clearAllMocks(); awardLoyaltyPoints.mockResolvedValue(); });

// ── initializePayment ─────────────────────────────────────────────────────────
describe("POST /initialize", () => {
  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/initialize").send({ amount: 1000, orderId: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await request(app).post("/initialize").send({ email: "a@b.com", orderId: "abc" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when orderId is missing", async () => {
    const res = await request(app).post("/initialize").send({ email: "a@b.com", amount: 500 });
    expect(res.status).toBe(400);
  });

  it("returns Paystack data on success", async () => {
    axios.post.mockResolvedValue({
      data: { data: { authorization_url: "https://paystack.com/pay/x", reference: "ref123" } },
    });
    const res = await request(app).post("/initialize")
      .send({ email: "a@b.com", amount: 1000, orderId: "abc123" });
    expect(res.status).toBe(200);
    expect(res.body.authorization_url).toBe("https://paystack.com/pay/x");
  });

  it("returns 500 when Paystack API fails", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));
    const res = await request(app).post("/initialize")
      .send({ email: "a@b.com", amount: 500, orderId: "abc" });
    expect(res.status).toBe(500);
  });
});

// ── verifyPayment ─────────────────────────────────────────────────────────────
describe("GET /verify/:reference", () => {
  it("returns 400 for invalid reference characters", async () => {
    const res = await request(app).get("/verify/ref<script>");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid reference/i);
  });

  it("returns 400 for references over 100 chars", async () => {
    const longRef = "a".repeat(101);
    const res = await request(app).get(`/verify/${longRef}`);
    expect(res.status).toBe(400);
  });

  it("marks order as paid on successful verification", async () => {
    const orderId = "6a0ff853cb79317ce83c3480";
    const mockOrder = {
      paymentStatus: "unpaid",
      paymentReference: null,
      paidAt: null,
      user: "uid",
      totalPrice: 1500,
      save: jest.fn().mockResolvedValue(true),
    };
    axios.get.mockResolvedValue({
      data: { data: { status: "success", metadata: { orderId }, reference: "ref-ok",
        amount: 150000, currency: "KES", channel: "card", paid_at: new Date().toISOString() } },
    });
    Order.findById.mockResolvedValue(mockOrder);

    const res = await request(app).get("/verify/ref-ok");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockOrder.save).toHaveBeenCalled();
    expect(mockOrder.paymentStatus).toBe("paid");
    expect(awardLoyaltyPoints).toHaveBeenCalled();
  });

  it("does NOT re-save or re-award if order already paid (idempotency guard)", async () => {
    const orderId = "6a0ff853cb79317ce83c3480";
    const mockOrder = { paymentStatus: "paid", save: jest.fn() };
    axios.get.mockResolvedValue({
      data: { data: { status: "success", metadata: { orderId }, reference: "ref-dup",
        amount: 150000, currency: "KES", channel: "card", paid_at: new Date().toISOString() } },
    });
    Order.findById.mockResolvedValue(mockOrder);

    await request(app).get("/verify/ref-dup");
    expect(mockOrder.save).not.toHaveBeenCalled();
    expect(awardLoyaltyPoints).not.toHaveBeenCalled();
  });

  it("falls back to DB when Paystack returns pending but order is already paid", async () => {
    const orderId = "6a0ff853cb79317ce83c3480";
    const mockOrder = { paymentStatus: "paid", paidAt: new Date() };
    axios.get.mockResolvedValue({
      data: { data: { status: "pending", metadata: { orderId }, reference: "ref-fb",
        amount: 150000, currency: "KES", channel: "card" } },
    });
    Order.findById.mockResolvedValue(mockOrder);

    const res = await request(app).get("/verify/ref-fb");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns success:false for genuinely unpaid pending order", async () => {
    const orderId = "6a0ff853cb79317ce83c3480";
    axios.get.mockResolvedValue({
      data: { data: { status: "pending", metadata: { orderId }, reference: "ref-pend",
        amount: 150000, currency: "KES", channel: "card" } },
    });
    Order.findById.mockResolvedValue({ paymentStatus: "unpaid" });

    const res = await request(app).get("/verify/ref-pend");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
  });

  it("returns 500 when Paystack API throws", async () => {
    axios.get.mockRejectedValue(new Error("Timeout"));
    const res = await request(app).get("/verify/valid-ref");
    expect(res.status).toBe(500);
  });
});

// ── webhook ───────────────────────────────────────────────────────────────────
describe("POST /webhook", () => {
  it("returns 401 for invalid HMAC signature", async () => {
    const res = await request(app).post("/webhook")
      .set("x-paystack-signature", "badsignature")
      .send({ event: "charge.success", data: {} });
    expect(res.status).toBe(401);
  });

  it("returns 200 and marks order paid on valid charge.success", async () => {
    const orderId = "6a0ff853cb79317ce83c3480";
    const payload = {
      event: "charge.success",
      data: { reference: "wh-ref", paid_at: new Date().toISOString(),
        metadata: { orderId } },
    };
    const sig = signPayload(payload);
    const mockOrder = {
      paymentStatus: "unpaid", save: jest.fn().mockResolvedValue(true),
      user: "uid", totalPrice: 800,
    };
    Order.findById.mockResolvedValue(mockOrder);

    const res = await request(app).post("/webhook")
      .set("x-paystack-signature", sig)
      .send(payload);

    expect(res.status).toBe(200);
    expect(mockOrder.paymentStatus).toBe("paid");
    expect(mockOrder.save).toHaveBeenCalled();
    expect(awardLoyaltyPoints).toHaveBeenCalled();
  });

  it("returns 200 for non-charge.success events without touching DB", async () => {
    const payload = { event: "transfer.success", data: {} };
    const sig = signPayload(payload);

    const res = await request(app).post("/webhook")
      .set("x-paystack-signature", sig)
      .send(payload);

    expect(res.status).toBe(200);
    expect(Order.findById).not.toHaveBeenCalled();
  });

  it("returns 200 for charge.success with invalid orderId (no DB hit)", async () => {
    const payload = { event: "charge.success", data: { reference: "r", paid_at: new Date(),
      metadata: { orderId: "not-a-valid-objectid" } } };
    const sig = signPayload(payload);

    const res = await request(app).post("/webhook")
      .set("x-paystack-signature", sig)
      .send(payload);

    expect(res.status).toBe(200);
    expect(Order.findById).not.toHaveBeenCalled();
  });
});
