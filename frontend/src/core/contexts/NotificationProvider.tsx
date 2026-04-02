// frontend/src/core/contexts/NotificationProvider.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { Toast } from "@/shared/components/ui/Toast";

type ToastTone = "success" | "info" | "warning" | "danger";

interface ToastPayload {
  message: string;
  title?: string;
  tone?: ToastTone;
  variant?: ToastTone;
}

interface ToastItem {
  id: number;
  message: string;
  title?: string;
  tone: ToastTone;
}

interface NotificationContextValue {
  showToast: (payload: ToastPayload) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef<number[]>([]);

  const showToast = useCallback(
    ({ message, title, tone, variant }: ToastPayload) => {
      const toastTone: ToastTone = tone ?? variant ?? "info";
      const id = Date.now() + Math.floor(Math.random() * 1000);

      setToasts((current) => [...current, { id, message, title, tone: toastTone }]);

      const timeoutId = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timeoutRefs.current = timeoutRefs.current.filter((timerId) => timerId !== timeoutId);
      }, 4000);

      timeoutRefs.current = [...timeoutRefs.current, timeoutId];
    },
    []
  );

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);

  const value = useMemo<NotificationContextValue>(() => ({ showToast }), [showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.tone} title={toast.title}>
            {toast.message}
          </Toast>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
