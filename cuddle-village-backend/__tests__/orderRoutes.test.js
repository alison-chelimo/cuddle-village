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
  it("returns 400 when status is missing", async () => {
    const res = await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status/i);
  });

  it("returns 404 when order not found", async () => {
    Order.findByIdAndUpdate.mockResolvedValue(null);
    const res = await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "delivered" });
    expect(res.status).toBe(404);
  });

  it("updates order status successfully", async () => {
    const updatedOrder = { _id: "o1", status: "delivered", isDelivered: true };
    Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);
    const res = await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("delivered");
  });

  it("sets isDelivered=true when status is delivered", async () => {
    Order.findByIdAndUpdate.mockResolvedValue({ _id: "o1", status: "delivered", isDelivered: true });
    await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "delivered" });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ $set: expect.objectContaining({ isDelivered: true }) }),
      expect.anything()
    );
  });

  it("sets isPaid and paymentStatus when status is paid", async () => {
    Order.findByIdAndUpdate.mockResolvedValue({ _id: "o1", status: "paid" });
    await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "paid" });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ $set: expect.objectContaining({ isPaid: true, paymentStatus: "paid" }) }),
      expect.anything()
    );
  });

  it("sets paymentStatus=unpaid when status is cancelled", async () => {
    Order.findByIdAndUpdate.mockResolvedValue({ _id: "o1", status: "cancelled" });
    await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "cancelled" });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ $set: expect.objectContaining({ paymentStatus: "unpaid" }) }),
      expect.anything()
    );
  });

  it("returns 500 on unexpected DB error", async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error("DB crash"));
    const res = await request(app).put("/orders/6a0ff853cb79317ce83c3480").send({ status: "pending" });
    expect(res.status).toBe(500);
  });
});
