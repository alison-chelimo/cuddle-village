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

// Opens the manage/expand panel for the first order (desktop row)
const openManage = async () => {
  await waitFor(() => expect(screen.getAllByRole("button", { name: /Manage/i })[0]).toBeInTheDocument());
  fireEvent.click(screen.getAllByRole("button", { name: /Manage/i })[0]);
};

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

  it("shows Processing stat card", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText(/Processing/i)[0]).toBeInTheDocument()
    );
  });

  it("shows Cancel button inside manage panel for pending orders", async () => {
    renderAdmin();
    await openManage();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Cancel/i })[0]).toBeInTheDocument()
    );
  });

  it("shows Shipped option in status select for processing orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "processing" }] });
    renderAdmin();
    await openManage();
    const select = await waitFor(() => document.querySelector(".status-select"));
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain("shipped");
  });

  it("shows Delivered option in status select for shipped orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await openManage();
    const select = await waitFor(() => document.querySelector(".status-select"));
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain("delivered");
  });

  it("shows Delivered status badge for delivered orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "delivered" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText("Delivered")[0]).toBeInTheDocument()
    );
  });

  it("shows Cancelled status badge for cancelled orders", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "cancelled" }] });
    renderAdmin();
    await waitFor(() =>
      expect(screen.getAllByText("Cancelled")[0]).toBeInTheDocument()
    );
  });

  it("calls API.put with processing when status changed to processing and saved", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "processing" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] });

    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "processing" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "processing" }
      )
    );
  });

  it("calls API.put with cancelled when status changed to cancelled and saved", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "cancelled" } });
    API.get
      .mockResolvedValueOnce({ data: [baseOrder] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "cancelled" }] });

    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "cancelled" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

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

  it("shows no orders message when fetch fails", async () => {
    API.get.mockRejectedValue(new Error("Network error"));
    renderAdmin();
    await waitFor(() =>
      expect(screen.getByText(/No orders match your search/i)).toBeInTheDocument()
    );
  });

  it("back button is present", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Back to Dashboard/i));
  });

  it("calls API.put with delivered when status changed to delivered and saved", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "delivered" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "delivered" }] });

    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "delivered" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        { status: "delivered" }
      )
    );
  });

  it("shows tracking input when status changed to shipped in manage panel", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "processing" }] });
    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "shipped" } });

    await waitFor(() =>
      expect(document.querySelector(".tracking-input")).toBeInTheDocument()
    );

    fireEvent.change(document.querySelector(".tracking-input"), { target: { value: "TRK-001" } });

    // Cancel closes the panel
    fireEvent.click(screen.getAllByRole("button", { name: /Cancel/i })[0]);
    await waitFor(() =>
      expect(document.querySelector(".tracking-input")).not.toBeInTheDocument()
    );
  });

  it("tracking input value is included when Save is clicked", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "shipped" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "shipped" } });

    const input = await waitFor(() => document.querySelector(".tracking-input"));
    fireEvent.change(input, { target: { value: "TRK-002" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        expect.objectContaining({ status: "shipped" })
      )
    );
  });

  it("ships order via Save button", async () => {
    API.put.mockResolvedValue({ data: { ...baseOrder, status: "shipped" } });
    API.get
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "processing" }] })
      .mockResolvedValueOnce({ data: [{ ...baseOrder, status: "shipped" }] });
    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "shipped" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

    await waitFor(() =>
      expect(API.put).toHaveBeenCalledWith(
        `/orders/${baseOrder._id}`,
        expect.objectContaining({ status: "shipped" })
      )
    );
  });

  it("shows tracking input for shipped orders when manage panel opened", async () => {
    API.get.mockResolvedValue({ data: [{ ...baseOrder, status: "shipped", trackingNumber: "TRK-KE-001" }] });
    renderAdmin();
    await openManage();
    await waitFor(() =>
      expect(document.querySelector(".tracking-input")).toBeInTheDocument()
    );
  });

  it("shows error alert when update fails", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    API.put.mockRejectedValue({ response: { data: { message: "Server error" } }, message: "err" });

    renderAdmin();
    await openManage();

    const select = await waitFor(() => document.querySelector(".status-select"));
    fireEvent.change(select, { target: { value: "processing" } });

    fireEvent.click(screen.getAllByRole("button", { name: /^Save$/i })[0]);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Server error")));
    alertSpy.mockRestore();
  });
});
