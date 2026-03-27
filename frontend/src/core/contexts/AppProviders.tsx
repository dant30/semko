import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";

import { ThemeProvider } from "./ThemeProvider";
import { NotificationProvider } from "./NotificationProvider";
import { store } from "@/core/store";
import { registerApiInterceptors } from "@/core/api/interceptors";
import { AuthProvider } from "@/features/auth/store/AuthContext";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    registerApiInterceptors();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
