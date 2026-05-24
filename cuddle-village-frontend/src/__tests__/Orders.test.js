import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock the API module
jest.mock("../services/api", () => ({
  get: jest.fn(),
}));

import API from "../services/api";
import Orders from "../pages/Orders";

const renderOrders = () =>
  render(<MemoryRouter><Orders /></MemoryRouter>);

describe("Orders page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows skeleton loaders while fetching", () => {
    API.get.mockReturnValue(new Promise(() => {})); // never resolves
    renderOrders();
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("shows error banner when API fails", async () => {
    API.get.mockRejectedValue(new Error("Network error"));
    renderOrders();
    await waitFor(() =>
      expect(screen.getByText(/could not load/i)).toBeInTheDocument()
    );
  });

  it("shows empty state when no orders", async () => {
    API.get.mockResolvedValue({ data: [] });
    renderOrders();
    await waitFor(() =>
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
    );
  });

  it("renders order cards for returned orders", async () => {
    API.get.mockResolvedValue({
      data: [
        {
          _id: "abc123def456",
          status: "pending",
          paymentStatus: "unpaid",
          totalPrice: 1500,
          createdAt: new Date().toISOString(),
          orderItems: [{ _id: "i1", name: "Baby Toy", qty: 1, price: 1500 }],
        },
      ],
    });
    renderOrders();
    // "My Orders" is always in DOM; wait for the order total (data-dependent)
    await waitFor(() =>
      expect(screen.getByText(/1.?500/)).toBeInTheDocument()
    );
  });

  it("expands order detail on click", async () => {
    API.get.mockResolvedValue({
      data: [
        {
          _id: "abc123def456",
          status: "shipped",
          paymentStatus: "paid",
          totalPrice: 2000,
          createdAt: new Date().toISOString(),
          orderItems: [{ _id: "i1", name: "Baby Swing", qty: 1, price: 2000 }],
        },
      ],
    });
    renderOrders();
    await waitFor(() => expect(screen.getByText(/2.?000/)).toBeInTheDocument());

    // Click the summary row to expand
    fireEvent.click(document.querySelector(".order-summary-row"));
    await waitFor(() =>
      expect(screen.getByText("Baby Swing")).toBeInTheDocument()
    );
  });

  it("collapses order on second click", async () => {
    API.get.mockResolvedValue({
      data: [
        {
          _id: "abc123def456",
          status: "delivered",
          paymentStatus: "paid",
          totalPrice: 3000,
          createdAt: new Date().toISOString(),
          orderItems: [{ _id: "i1", name: "Stroller", qty: 1, price: 3000 }],
        },
      ],
    });
    renderOrders();
    await waitFor(() => expect(screen.getByText(/3.?000/)).toBeInTheDocument());

    const row = document.querySelector(".order-summary-row");
    fireEvent.click(row); // open
    await waitFor(() => expect(screen.getByText("Stroller")).toBeInTheDocument());
    fireEvent.click(row); // close
    await waitFor(() => expect(screen.queryByText("Stroller")).not.toBeInTheDocument());
  });

  it("displays correct status badge for each status", async () => {
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    for (const status of statuses) {
      jest.clearAllMocks();
      API.get.mockResolvedValue({
        data: [{
          _id: `id-${status}`, status, paymentStatus: "unpaid",
          totalPrice: 100, createdAt: new Date().toISOString(), orderItems: [],
        }],
      });
      const { unmount } = renderOrders();
      await waitFor(() =>
        expect(screen.getByText(new RegExp(status, "i"))).toBeInTheDocument()
      );
      unmount();
    }
  });

  it("uses fallback config for unknown status and paymentStatus", async () => {
    API.get.mockResolvedValue({
      data: [{
        _id: "zzz999",
        status: "unknown-status",
        paymentStatus: "unknown-payment",
        totalPrice: 100,
        createdAt: new Date().toISOString(),
        orderItems: [],
      }],
    });
    renderOrders();
    await waitFor(() =>
      expect(document.querySelector(".order-card")).toBeInTheDocument()
    );
  });

  it("shows a link to browse products in empty state", async () => {
    API.get.mockResolvedValue({ data: [] });
    renderOrders();
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /shopping/i })).toBeInTheDocument()
    );
  });

  it("shows cancelled message in StatusTimeline when cancelled order is expanded", async () => {
    API.get.mockResolvedValue({
      data: [{
        _id: "abc123def456",
        status: "cancelled",
        paymentStatus: "unpaid",
        totalPrice: 500,
        createdAt: new Date().toISOString(),
        orderItems: [],
      }],
    });
    renderOrders();
    await waitFor(() => expect(document.querySelector(".order-card")).toBeInTheDocument());
    fireEvent.click(document.querySelector(".order-summary-row"));
    await waitFor(() =>
      expect(screen.getByText(/This order was cancelled/i)).toBeInTheDocument()
    );
  });

  it("shows copy button for order with tracking number — execCommand fallback path", async () => {
    document.execCommand = jest.fn().mockReturnValue(true);
    API.get.mockResolvedValue({
      data: [{
        _id: "abc123def456",
        status: "shipped",
        paymentStatus: "paid",
        totalPrice: 2500,
        createdAt: new Date().toISOString(),
        trackingNumber: "TRK-KE-12345",
        orderItems: [{ _id: "i1", name: "Toy Box", qty: 1, price: 2500 }],
      }],
    });
    renderOrders();
    await waitFor(() => expect(screen.getByText(/2.?500/)).toBeInTheDocument());
    fireEvent.click(document.querySelector(".order-summary-row"));
    await waitFor(() => expect(screen.getByText("TRK-KE-12345")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    delete document.execCommand;
  });

  it("copy button uses clipboard API when available", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    API.get.mockResolvedValue({
      data: [{
        _id: "abc123def456",
        status: "shipped",
        paymentStatus: "paid",
        totalPrice: 2500,
        createdAt: new Date().toISOString(),
        trackingNumber: "TRK-KE-99999",
        orderItems: [],
      }],
    });
    renderOrders();
    await waitFor(() => expect(screen.getByText(/2.?500/)).toBeInTheDocument());
    fireEvent.click(document.querySelector(".order-summary-row"));
    await waitFor(() => expect(screen.getByText("TRK-KE-99999")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("TRK-KE-99999"));
    // cleanup
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true, writable: true });
  });

  it("shows shipping address and payment reference when expanded", async () => {
    API.get.mockResolvedValue({
      data: [
        {
          _id: "abc123def456",
          status: "delivered",
          paymentStatus: "paid",
          totalPrice: 4000,
          createdAt: new Date().toISOString(),
          paymentReference: "REF-XYZ-9999",
          shippingAddress: { address: "123 Main St", city: "Nairobi" },
          orderItems: [{ _id: "i1", name: "Car Seat", qty: 1, price: 4000 }],
        },
      ],
    });
    renderOrders();
    await waitFor(() => expect(screen.getByText(/4.?000/)).toBeInTheDocument());

    fireEvent.click(document.querySelector(".order-summary-row"));
    await waitFor(() => {
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/REF-XYZ-9999/)).toBeInTheDocument();
    });
  });
});
