import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";

import { ThemeProvider } from "./ThemeProvider";
import { NotificationProvider } from "./NotificationProvider";
import { store } from "@/core/store";
import { registerApiInterceptors } from "@/core/api/interceptors";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    registerApiInterceptors();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}
