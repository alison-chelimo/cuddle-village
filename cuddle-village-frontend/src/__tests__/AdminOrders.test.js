import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../services/api", () => ({ get: jest.fn(), put: jest.fn() }));
jest.mock("../components/AdminLayout", () => ({ children }) => <div>{children}</div>);

import API from "../services/api";
import AdminOrders from "../pages/admin/AdminOrders";

const renderAdmin = () =>
  render(<MemoryRouter><AdminOrders /></MemoryRouter>);

const baseOrder = {
  _id: "6a0ff853cb79317ce83c3480",
  status: "pending",
  paymentStatus: "unpaid",
  totalPrice: 2500,
  orderItems: [{ name: "Toy", qty: 1 }],
  user: { name: "Jane Doe", email: "jane@example.com" },
};

// The component renders both a desktop table and mobile cards, so many
// text nodes appear twice. Use getAllByText(...)[0] to handle that.

describe("AdminOrders page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.get.mockResolvedValue({ data: [baseOrder] });
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "paid" } });
  });

  it("renders loading state initially then shows orders", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Jane Doe/i)[0]).toBeInTheDocument()
    );
  });

  it("displays order total correctly", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/2,500/)[0]).toBeInTheDocument()
    );
  });

  it("shows Mark Paid button for pending orders", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Mark Paid/i)[0]).toBeInTheDocument()
    );
  });

  it("shows Cancel button for pending orders", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Cancel/i)[0]).toBeInTheDocument()
    );
  });

  it("shows Deliver button for paid orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "paid" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Deliver/i })[0]).toBeInTheDocument()
    );
  });

  it("shows no action text for delivered orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "delivered" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/No actions/i)[0]).toBeInTheDocument()
    );
  });

  it("shows no action text for cancelled orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "cancelled" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/No actions/i)[0]).toBeInTheDocument()
    );
  });

  it("calls API.put when Mark Paid is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "paid" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "paid" }] });

    renderAdmin();
    await waitFor(() => screen.getAllByText(/Mark Paid/i)[0]);
    fireEvent.click(screen.getAllByText(/Mark Paid/i)[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "paid" }
      )
    );
  });

  it("calls API.put with cancelled when Cancel is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "cancelled" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "cancelled" }] });

    renderAdmin();
    await waitFor(() => screen.getAllByText(/Cancel/i)[0]);
    fireEvent.click(screen.getAllByText(/Cancel/i)[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "cancelled" }
      )
    );
  });

  it("shows revenue stat", async () => {
    API.get.mockResolvedValue({
      data: [
        { ...baseOrder, status: "delivered", paymentStatus: "paid", totalPrice: 5000 },
      ],
    });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getByText(/Revenue/i)).toBeInTheDocument()
    );
  });

  it("shows no orders when fetch fails", async () => {
    API.get.mockRejectedValue(new Error("Network error"));
    renderAdmin();
    await waitFor(() =>
      expect(screen.getByText(/No orders found/i)).toBeInTheDocument()
    );
  });

  it("back button is present", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Back to Dashboard/i));
  });

  it("calls API.put with delivered when Deliver is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "delivered" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "paid" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "delivered" }] });

    renderAdmin();
    await waitFor(() => screen.getAllByRole("button", { name: /Deliver/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Deliver/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "delivered" }
      )
    );
  });

  it("shows error alert when update fails", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    API.put.mockRejectedValue({ response: { data: { message: "Server error" } }, message: "err" });

    renderAdmin();
    await waitFor(() => screen.getAllByText(/Mark Paid/i)[0]);
    fireEvent.click(screen.getAllByText(/Mark Paid/i)[0]);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Server error")));
    alertSpy.mockRestore();
  });
});
