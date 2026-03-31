// frontend/src/shared/components/layout/PageContainer.tsx
import type { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return <main className="container-fluid py-6 lg:py-8">{children}</main>;
}
