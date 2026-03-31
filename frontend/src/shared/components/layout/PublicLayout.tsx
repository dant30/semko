// frontend/src/shared/components/layout/PublicLayout.tsx
import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
}
