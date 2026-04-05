import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { UserDetailContent } from "../components/UserDetailContent";

const baseUser = {
  id: 1,
  username: "jdoe",
  email: "jdoe@example.com",
  first_name: "John",
  last_name: "Doe",
  phone_number: "123-456-7890",
  role: { id: 1, name: "Admin", code: "admin" },
  is_active: true,
  is_staff: false,
  must_change_password: false,
  last_login: null,
  updated_at: "2024-01-01T12:00:00Z",
} as const;

describe("UserDetailContent", () => {
  it("renders a fallback date when profile date is invalid", () => {
    render(
      <UserDetailContent
        canManageUsers={false}
        error=""
        isLoading={false}
        onStatusChange={() => undefined}
        user={{
          ...baseUser,
          date_joined: "not-a-date",
          created_at: "not-a-date",
        }}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });

  it("falls back to created_at when date_joined is invalid", () => {
    render(
      <UserDetailContent
        canManageUsers={false}
        error=""
        isLoading={false}
        onStatusChange={() => undefined}
        user={{
          ...baseUser,
          date_joined: "not-a-date",
          created_at: "2024-01-03T12:00:00Z",
        }}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
  });
});
