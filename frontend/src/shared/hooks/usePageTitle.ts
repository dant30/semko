// frontend/src/shared/hooks/usePageTitle.ts
import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
