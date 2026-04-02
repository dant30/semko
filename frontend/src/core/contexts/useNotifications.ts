// frontend/src/core/contexts/useNotifications.ts
import { useContext } from "react";

import { NotificationContext } from "./NotificationProvider";

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}

export const useToast = useNotifications;
