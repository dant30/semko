// frontend/src/shared/components/layout/PageContainer.tsx
import type { ElementType, PropsWithChildren } from "react";

import { cn } from "@/shared/utils/classnames";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
  as?: ElementType;
}

export function PageContainer({ children, className, as: Component = "main" }: PageContainerProps) {
  return (
    <Component className={cn("container-fluid py-6 lg:py-8", className)}>
      {children}
    </Component>
  );
}
