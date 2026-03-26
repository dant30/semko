import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { Toast } from "@/shared/components/ui/Toast";

type ToastTone = "success" | "info" | "warning" | "danger";

interface ToastItem {
  id: number;
  message: string;
  title?: string;
  tone: ToastTone;
}

interface NotificationContextValue {
  showToast: (payload: { message: string; title?: string; tone?: ToastTone }) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    ({ message, title, tone = "info" }: { message: string; title?: string; tone?: ToastTone }) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, message, title, tone }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  const value = useMemo<NotificationContextValue>(() => ({ showToast }), [showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} tone={toast.tone} title={toast.title}>
            {toast.message}
          </Toast>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
