// frontend/src/features/notifications/store/notifications.slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  NotificationFilters,
  NotificationChannel,
  NotificationStatus,
  NotificationEventCode,
} from "@/features/notifications/types/notification";

export const notificationsSliceKey = "notifications";

export interface NotificationsState {
  filters: NotificationFilters;
  selectedNotificationId: number | null;
  viewType: "inbox" | "preferences" | "archived" | "";
  showDetailDrawer: boolean;
}

const initialFilters: NotificationFilters = {
  search: "",
  status: "unread",
  channel: "",
  eventCode: "",
  activeOnly: false,
};

const initialState: NotificationsState = {
  filters: initialFilters,
  selectedNotificationId: null,
  viewType: "inbox",
  showDetailDrawer: false,
};

const notificationsSlice = createSlice({
  name: notificationsSliceKey,
  initialState,
  reducers: {
    // Filter management
    resetNotificationFilters(state) {
      state.filters = { ...initialFilters };
    },
    resetNotificationsState() {
      return initialState;
    },
    setNotificationFilters(state, action: PayloadAction<Partial<NotificationFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setNotificationSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    setNotificationStatus(state, action: PayloadAction<NotificationStatus | "">) {
      state.filters.status = action.payload;
    },
    setNotificationChannel(state, action: PayloadAction<NotificationChannel | "">) {
      state.filters.channel = action.payload;
    },
    setNotificationEventCode(state, action: PayloadAction<NotificationEventCode | "">) {
      state.filters.eventCode = action.payload;
    },

    // View management
    setNotificationViewType(
      state,
      action: PayloadAction<"inbox" | "preferences" | "archived" | "">
    ) {
      state.viewType = action.payload;
    },
    setNotificationDetailDrawerOpen(state, action: PayloadAction<boolean>) {
      state.showDetailDrawer = action.payload;
    },

    // Selection management
    selectNotification(state, action: PayloadAction<number | null>) {
      state.selectedNotificationId = action.payload;
      if (action.payload !== null) {
        state.showDetailDrawer = true;
      }
    },
    clearSelectedNotification(state) {
      state.selectedNotificationId = null;
      state.showDetailDrawer = false;
    },
  },
});

export const {
  resetNotificationFilters,
  setNotificationFilters,
  setNotificationSearch,
  setNotificationStatus,
  setNotificationChannel,
  setNotificationEventCode,
  setNotificationViewType,
  setNotificationDetailDrawerOpen,
  selectNotification,
  clearSelectedNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

