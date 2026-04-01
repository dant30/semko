// frontend/src/shared/components/layout/PublicLayout.tsx
import { Outlet } from "react-router-dom";

import { Stack } from "@/shared/components/ui";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-shell px-4 py-8">
      <Stack align="center" justify="center" className="min-h-screen">
        <Outlet />
      </Stack>
    </div>
  );
}
