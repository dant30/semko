import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { AuthProvider } from "../store/AuthContext";
import { authApi } from "../services/auth.api";

vi.mock("../services/auth.api");

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<>{children}</>} />
        <Route path="/app/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  </AuthProvider>
);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it("tries to login and redirects on success", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ access: "abc", refresh: "def" });
    vi.mocked(authApi.fetchMe).mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    });

    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    await user.type(screen.getByLabelText(/Username/i), "testuser");
    await user.type(screen.getByLabelText(/Password/i), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(authApi.login).toHaveBeenCalledWith({ username: "testuser", password: "secret" });
    expect(authApi.fetchMe).toHaveBeenCalledWith("abc");
  });

  it("shows error message on login failure", async () => {
    vi.mocked(authApi.login).mockRejectedValue({ response: { data: { detail: "Invalid credentials" } } });

    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    await user.type(screen.getByLabelText(/Username/i), "invalid");
    await user.type(screen.getByLabelText(/Password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
