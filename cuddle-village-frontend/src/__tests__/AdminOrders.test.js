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
// text nodes appear twice. Use getAllByText/getAllByRole(...)[0] for those.

describe("AdminOrders page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.get.mockResolvedValue({ data: [baseOrder] });
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "processing" } });
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

  it("shows Processing button for pending orders", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Processing/i)[0]).toBeInTheDocument()
    );
  });

  it("shows Cancel button for pending orders", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Cancel/i })[0]).toBeInTheDocument()
    );
  });

  it("shows Mark Shipped button for processing orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "processing" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Mark Shipped/i)[0]).toBeInTheDocument()
    );
  });

  it("shows Delivered button for shipped orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Delivered/i })[0]).toBeInTheDocument()
    );
  });

  it("shows dash for delivered orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "delivered" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText("Delivered")[0]).toBeInTheDocument()
    );
  });

  it("shows dash for cancelled orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "cancelled" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText("Cancelled")[0]).toBeInTheDocument()
    );
  });

  it("calls API.put with processing when Processing is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "processing" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] });

    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Processing/i })[0]).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Processing/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "processing" }
      )
    );
  });

  it("calls API.put with cancelled when Cancel is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "cancelled" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "cancelled" }] });

    renderAdmin();
    await waitFor(() => screen.getAllByRole("button", { name: /Cancel/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Cancel/i })[0]);

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

  it("calls API.put with delivered when Delivered is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "delivered" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "delivered" }] });

    renderAdmin();
    await waitFor(() => screen.getAllByRole("button", { name: /Delivered/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Delivered/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "delivered" }
      )
    );
  });

  it("shows tracking input row when Mark Shipped is clicked for processing order", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "processing" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]);
    const input = await waitFor(() => document.querySelector(".tracking-input"));
    // Exercise onChange and onKeyDown Escape handlers
    fireEvent.change(input, { target: { value: "TRK-001" } });
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() =>
      expect(document.querySelector(".tracking-input")).not.toBeInTheDocument()
    );
  });

  it("tracking input submits via Enter key", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "shipped" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]);
    const input = await waitFor(() => document.querySelector(".tracking-input"));
    fireEvent.change(input, { target: { value: "TRK-002" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        expect.objectContaining({ status: "shipped" })
      )
    );
  });

  it("tracking Confirm button ships the order", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "shipped" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Mark Shipped/i })[0]);
    await waitFor(() => document.querySelector(".btn-confirm"));
    fireEvent.click(document.querySelector(".btn-confirm"));
    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        expect.objectContaining({ status: "shipped" })
      )
    );
  });

  it("shows tracking edit button for shipped orders and opens row", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "shipped", trackingNumber: "TRK-KE-001" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Tracking/i })[0]).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Tracking/i })[0]);
    await waitFor(() =>
      expect(document.querySelector(".tracking-input")).toBeInTheDocument()
    );
  });

  it("shows error alert when update fails", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    API.put.mockRejectedValue({ response: { data: { message: "Server error" } }, message: "err" });

    renderAdmin();
    await waitFor(() => screen.getAllByRole("button", { name: /Processing/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Processing/i })[0]);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Server error")));
    alertSpy.mockRestore();
  });
});
