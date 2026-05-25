jest.mock("../models/Order");
jest.mock("../models/Product");
jest.mock("../models/PromoCode");
jest.mock("../controllers/promoController");
jest.mock("../middleware/rateLimiter", () => ({ orderLimiter: (req, res, next) => next() }));
jest.mock("../middleware/authMiddleware", () => ({
  protect: (req, res, next) => { req.user = { _id: "user123", role: "user" }; next(); },
  adminOnly: (req, res, next) => next(),
}));

const request  = require("supertest");
const express  = require("express");
const Order    = require("../models/Order");
const Product  = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { resolvePromo } = require("../controllers/promoController");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/orders", require("../routes/orderRoutes"));
  return app;
}

let app;
beforeAll(() => { app = makeApp(); });
beforeEach(() => { jest.clearAllMocks(); });

// ── POST /orders ──────────────────────────────────────────────────────────────
describe("POST /orders — create order", () => {
  it("returns 400 when orderItems is empty", async () => {
    const res = await request(app).post("/orders").send({ orderItems: [], totalPrice: 100 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no items/i);
  });

  it("returns 400 for invalid product ObjectId", async () => {
    const res = await request(app).post("/orders").send({
      orderItems: [{ product: "not-a-valid-id", qty: 1 }], totalPrice: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid product/i);
  });

  it("returns 404 when product not found", async () => {
    Product.findById.mockResolvedValue(null);
    const res = await request(app).post("/orders").send({
      orderItems: [{ product: "6a0ff853cb79317ce83c3480", qty: 1 }], totalPrice: 100,
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 when product is out of stock", async () => {
    Product.findById.mockResolvedValue({ name: "Widget", stock: 0, save: jest.fn() });
    const res = await request(app).post("/orders").send({
      orderItems: [{ product: "6a0ff853cb79317ce83c3480", qty: 2 }], totalPrice: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/out of stock/i);
  });

  it("creates order and decrements stock", async () => {
    const mockProduct = { name: "Toy", stock: 5, save: jest.fn().mockResolvedValue(true) };
    Product.findById.mockResolvedValue(mockProduct);
    resolvePromo.mockResolvedValue({ valid: false });
    const mockOrder = { _id: "order1", totalPrice: 100 };
    Order.create.mockResolvedValue(mockOrder);

    const res = await request(app).post("/orders").send({
      orderItems: [{ product: "6a0ff853cb79317ce83c3480", qty: 2 }],
      shippingAddress: { address: "123 Main St", city: "Nairobi", phone: "0700000000" },
      totalPrice: 100,
    });

    expect(res.status).toBe(201);
    expect(mockProduct.stock).toBe(3);
    expect(mockProduct.save).toHaveBeenCalled();
    expect(Order.create).toHaveBeenCalled();
  });

  it("applies valid promo code discount", async () => {
    const mockProduct = { name: "Toy", stock: 5, save: jest.fn().mockResolvedValue(true) };
    Product.findById.mockResolvedValue(mockProduct);
    resolvePromo.mockResolvedValue({
      valid: true, discount: 200,
      promo: { _id: "promo1", code: "SAVE200" },
    });
    PromoCode.findByIdAndUpdate.mockResolvedValue({});
    Order.create.mockResolvedValue({ _id: "o2", totalPrice: 800 });

    const res = await request(app).post("/orders").send({
      orderItems: [{ product: "6a0ff853cb79317ce83c3480", qty: 1 }],
      totalPrice: 1000, promoCode: "SAVE200",
    });

    expect(res.status).toBe(201);
    // finalTotal should be 1000 - 200 = 800
    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: 800, promoCode: "SAVE200", promoDiscount: 200 })
    );
  });
});

// ── GET /orders/my ────────────────────────────────────────────────────────────
describe("GET /orders/my", () => {
  it("returns the user's orders", async () => {
    Order.find.mockResolvedValue([{ _id: "o1" }, { _id: "o2" }]);
    const res = await request(app).get("/orders/my");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// ── GET /orders ───────────────────────────────────────────────────────────────
describe("GET /orders — admin", () => {
  it("returns all orders", async () => {
    Order.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([{ _id: "o1" }]) });
    const res = await request(app).get("/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

// ── PUT /orders/:id ───────────────────────────────────────────────────────────
describe("PUT /orders/:id — update status", () => {
  const orderId = "6a0ff853cb79317ce83c3480";

  it("returns 400 for an invalid status value", async () => {
    const res = await request(app).put(`/orders/${orderId}`).send({ status: "paid" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid status/i);
  });

  it("returns 404 when order not found", async () => {
    Order.findById.mockResolvedValue(null);
    const res = await request(app).put(`/orders/${orderId}`).send({ status: "delivered" });
    expect(res.status).toBe(404);
  });

  it("updates order status successfully", async () => {
    const mockOrder = { _id: orderId, status: "pending", isDelivered: false, save: jest.fn().mockResolvedValue(true) };
    Order.findById.mockResolvedValue(mockOrder);
    const res = await request(app).put(`/orders/${orderId}`).send({ status: "shipped" });
    expect(res.status).toBe(200);
    expect(mockOrder.status).toBe("shipped");
    expect(mockOrder.save).toHaveBeenCalled();
  });

  it("sets isDelivered=true when status is delivered", async () => {
    const mockOrder = { _id: orderId, status: "shipped", isDelivered: false, save: jest.fn().mockResolvedValue(true) };
    Order.findById.mockResolvedValue(mockOrder);
    await request(app).put(`/orders/${orderId}`).send({ status: "delivered" });
    expect(mockOrder.isDelivered).toBe(true);
  });

  it("accepts a missing status and still saves (trackingNumber only update)", async () => {
    const mockOrder = { _id: orderId, status: "shipped", isDelivered: false, trackingNumber: null, save: jest.fn().mockResolvedValue(true) };
    Order.findById.mockResolvedValue(mockOrder);
    const res = await request(app).put(`/orders/${orderId}`).send({ trackingNumber: "TRK-001" });
    expect(res.status).toBe(200);
    expect(mockOrder.trackingNumber).toBe("TRK-001");
  });

  it("returns 500 on unexpected DB error", async () => {
    Order.findById.mockRejectedValue(new Error("DB crash"));
    const res = await request(app).put(`/orders/${orderId}`).send({ status: "pending" });
    expect(res.status).toBe(500);
  });
});
