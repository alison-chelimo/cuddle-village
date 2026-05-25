jest.mock("../models/User");
jest.mock("../models/Order");
jest.mock("../models/LoyaltyTransaction");

const User = require("../models/User");
const Order = require("../models/Order");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const { calcTier, calcPoints, nextTierInfo, awardLoyaltyPoints } = require("../utils/loyaltyHelper");

describe("calcTier", () => {
  it("returns Bronze for 0 points", () => expect(calcTier(0)).toBe("Bronze"));
  it("returns Bronze for 999 points", () => expect(calcTier(999)).toBe("Bronze"));
  it("returns Silver at 1000 points", () => expect(calcTier(1000)).toBe("Silver"));
  it("returns Silver for 4999 points", () => expect(calcTier(4999)).toBe("Silver"));
  it("returns Gold at 5000 points", () => expect(calcTier(5000)).toBe("Gold"));
  it("returns Gold for 14999 points", () => expect(calcTier(14999)).toBe("Gold"));
  it("returns Platinum at 15000 points", () => expect(calcTier(15000)).toBe("Platinum"));
  it("returns Platinum above 15000", () => expect(calcTier(50000)).toBe("Platinum"));
});

describe("calcPoints", () => {
  it("returns 0 for amounts under 10", () => expect(calcPoints(9)).toBe(0));
  it("returns 1 for exactly 10", () => expect(calcPoints(10)).toBe(1));
  it("returns 10 for 100", () => expect(calcPoints(100)).toBe(10));
  it("returns 150 for 1500", () => expect(calcPoints(1500)).toBe(150));
  it("floors partial points", () => expect(calcPoints(15)).toBe(1));
});

describe("nextTierInfo", () => {
  it("returns 1000 when below Silver", () => expect(nextTierInfo(0)).toBe(1000));
  it("returns 5000 when Silver", () => expect(nextTierInfo(1500)).toBe(5000));
  it("returns 15000 when Gold", () => expect(nextTierInfo(6000)).toBe(15000));
  it("returns null at Platinum", () => expect(nextTierInfo(15000)).toBeNull());
  it("returns null above Platinum", () => expect(nextTierInfo(20000)).toBeNull());
});

describe("awardLoyaltyPoints", () => {
  const mockOrderId = "6a0ff853cb79317ce83c3480";
  const mockUserId  = "6a0ff853cb79317ce83c3481";

  beforeEach(() => {
    jest.clearAllMocks();
    LoyaltyTransaction.create = jest.fn().mockResolvedValue({});
  });

  it("awards points to user and updates order", async () => {
    const mockOrder = { pointsEarned: 0, save: jest.fn().mockResolvedValue(true) };
    const mockUser  = {
      loyaltyPoints: 0, lifetimePoints: 0, loyaltyTier: "Bronze",
      save: jest.fn().mockResolvedValue(true),
    };
    Order.findById = jest.fn().mockResolvedValue(mockOrder);
    User.findById  = jest.fn().mockResolvedValue(mockUser);

    await awardLoyaltyPoints(mockUserId, mockOrderId, 1000);

    expect(mockUser.loyaltyPoints).toBe(100);
    expect(mockUser.lifetimePoints).toBe(100);
    expect(mockOrder.pointsEarned).toBe(100);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockOrder.save).toHaveBeenCalled();
    expect(LoyaltyTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "earn", points: 100 })
    );
  });

  it("does not award if order.pointsEarned > 0 (idempotency guard)", async () => {
    Order.findById = jest.fn().mockResolvedValue({ pointsEarned: 50 });
    User.findById  = jest.fn();

    await awardLoyaltyPoints(mockUserId, mockOrderId, 500);

    expect(User.findById).not.toHaveBeenCalled();
    expect(LoyaltyTransaction.create).not.toHaveBeenCalled();
  });

  it("does not award if order not found", async () => {
    Order.findById = jest.fn().mockResolvedValue(null);
    User.findById  = jest.fn();

    await awardLoyaltyPoints(mockUserId, mockOrderId, 500);

    expect(User.findById).not.toHaveBeenCalled();
  });

  it("does not award 0 points for tiny orders", async () => {
    Order.findById = jest.fn().mockResolvedValue({ pointsEarned: 0, save: jest.fn() });
    User.findById  = jest.fn();

    await awardLoyaltyPoints(mockUserId, mockOrderId, 5);

    expect(User.findById).not.toHaveBeenCalled();
  });

  it("upgrades tier when crossing threshold", async () => {
    const mockOrder = { pointsEarned: 0, save: jest.fn().mockResolvedValue(true) };
    const mockUser  = {
      loyaltyPoints: 900, lifetimePoints: 900, loyaltyTier: "Bronze",
      save: jest.fn().mockResolvedValue(true),
    };
    Order.findById = jest.fn().mockResolvedValue(mockOrder);
    User.findById  = jest.fn().mockResolvedValue(mockUser);

    await awardLoyaltyPoints(mockUserId, mockOrderId, 1500);

    expect(mockUser.lifetimePoints).toBe(1050);
    expect(mockUser.loyaltyTier).toBe("Silver");
  });

  it("does not throw if an error occurs (non-fatal)", async () => {
    Order.findById = jest.fn().mockRejectedValue(new Error("DB error"));
    await expect(awardLoyaltyPoints(mockUserId, mockOrderId, 500)).resolves.toBeUndefined();
  });
});
