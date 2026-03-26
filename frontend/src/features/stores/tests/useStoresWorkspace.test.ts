import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useStoresWorkspace } from "../hooks/useStoresWorkspace";
import { storesApi } from "../services/stores.api";
import { rootReducer } from "../../../core/store/root-reducer";

vi.mock("../services/stores.api");
vi.mock("@/core/contexts/useNotifications", () => ({
  useNotifications: () => ({
    showToast: vi.fn(),
  }),
}));

const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store: createTestStore(), children });

describe("useStoresWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storesApi.fetchItems).mockResolvedValue([]);
    vi.mocked(storesApi.fetchReceivings).mockResolvedValue([]);
    vi.mocked(storesApi.fetchRequisitions).mockResolvedValue([]);
    vi.mocked(storesApi.fetchIssues).mockResolvedValue([]);
    vi.mocked(storesApi.fetchAdjustments).mockResolvedValue([]);
    vi.mocked(storesApi.fetchSuppliers).mockResolvedValue([]);
    vi.mocked(storesApi.fetchPurchaseOrders).mockResolvedValue([]);
    vi.mocked(storesApi.fetchSummary).mockResolvedValue({
      activeItems: 0,
      belowReorder: 0,
      totalStockOnHand: 0,
      totalReceivings: 0,
      totalIssues: 0,
      pendingRequisitions: 0,
      pendingAdjustments: 0,
      pendingPurchaseOrders: 0,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useStoresWorkspace(), { wrapper });

    expect(result.current.suppliers).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.editingSupplierId).toBeNull();
  });

  it("should fetch suppliers on mount", async () => {
    const data = [{ id: 1, name: "Suppler A", contact_name: "Alice", email: "alice@example.com", phone: "123", address: "street 1", is_active: true }];
    vi.mocked(storesApi.fetchSuppliers).mockResolvedValue(data);

    const { result } = renderHook(() => useStoresWorkspace(), { wrapper });

    await waitFor(() => {
      expect(result.current.suppliers).toEqual(data);
    });
  });

  it("should create a supplier", async () => {
    const createSpy = vi.mocked(storesApi.createSupplier).mockResolvedValue({
      id: 2,
      name: "New Supplier",
      contact_name: "Bob",
      email: "bob@example.com",
      phone: "321",
      address: "road 4",
      is_active: true,
    });

    const { result } = renderHook(() => useStoresWorkspace(), { wrapper });

    act(() => {
      result.current.setSupplierForm({
        name: "New Supplier",
        contact_name: "Bob",
        email: "bob@example.com",
        phone: "321",
        address: "road 4",
        is_active: true,
      });
    });

    await act(async () => {
      await result.current.submitForView("suppliers");
    });

    expect(createSpy).toHaveBeenCalledWith({
      name: "New Supplier",
      contact_name: "Bob",
      email: "bob@example.com",
      phone: "321",
      address: "road 4",
      is_active: true,
    });
  });

  it("should edit a supplier", async () => {
    const updateSpy = vi.mocked(storesApi.updateSupplier).mockResolvedValue({
      id: 3,
      name: "Updated Supplier",
      contact_name: "Cathy",
      email: "cathy@example.com",
      phone: "555",
      address: "avenue 9",
      is_active: false,
    });

    const { result } = renderHook(() => useStoresWorkspace(), { wrapper });

    act(() => {
      result.current.startEditSupplier({
        id: 3,
        name: "Updated Supplier",
        contact_name: "Cathy",
        email: "cathy@example.com",
        phone: "555",
        address: "avenue 9",
        is_active: false,
      });
    });

    await act(async () => {
      await result.current.submitForView("suppliers");
    });

    expect(updateSpy).toHaveBeenCalledWith(3, {
      name: "Updated Supplier",
      contact_name: "Cathy",
      email: "cathy@example.com",
      phone: "555",
      address: "avenue 9",
      is_active: false,
    });
    expect(result.current.editingSupplierId).toBeNull();
  });

  it("should delete a supplier", async () => {
    const deleteSpy = vi.mocked(storesApi.deleteSupplier).mockResolvedValue(undefined);
    const { result } = renderHook(() => useStoresWorkspace(), { wrapper });

    await act(async () => {
      await result.current.deleteSupplier(7);
    });

    expect(deleteSpy).toHaveBeenCalledWith(7);
  });
});
