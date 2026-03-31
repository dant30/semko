// frontend/src/shared/components/layout/AppHeader.tsx
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Inbox,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/core/contexts/useTheme";
import { appRoutes } from "@/core/constants/routes";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useAuthContext } from "@/features/auth/store/AuthContext";
import { clearAuth } from "@/features/auth/store/auth.slice";
import { notificationsApi } from "@/features/notifications/services/notifications.api";
import type { NotificationRecord } from "@/features/notifications/types/notification";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/shared/utils/classnames";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onToggleSidebarCollapse?: () => void;
  sidebarCollapsed?: boolean;
}

interface SearchTarget {
  label: string;
  path: string;
}

const SEARCH_TARGETS: SearchTarget[] = [
  { label: "Dashboard", path: appRoutes.dashboard },
  { label: "Users", path: appRoutes.users },
  { label: "Trips", path: appRoutes.trips },
  { label: "Vehicles", path: appRoutes.vehicles },
  { label: "Drivers", path: appRoutes.drivers },
  { label: "Clients", path: appRoutes.clients },
  { label: "Materials", path: appRoutes.materials },
  { label: "Stores", path: appRoutes.stores },
  { label: "Fuel", path: appRoutes.fuel },
  { label: "Maintenance", path: appRoutes.maintenance },
  { label: "Payroll", path: appRoutes.payroll },
  { label: "Reports", path: appRoutes.reports },
  { label: "Notifications", path: appRoutes.notifications },
  { label: "Settings", path: appRoutes.settings },
  { label: "Support", path: appRoutes.support },
];

export function AppHeader({ onToggleSidebar, onToggleSidebarCollapse, sidebarCollapsed }: AppHeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuthContext();
  const user = useAppSelector((state) => state.auth.user);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status !== "read").length,
    [notifications]
  );

  useEffect(() => {
    let active = true;

    notificationsApi
      .fetchInbox()
      .then((items) => {
        if (active) {
          setNotifications(items.results.slice(0, 8));
        }
      })
      .catch(() => {
        if (active) {
          setNotifications([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }

      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen || !notificationsMenuRef.current) {
      return undefined;
    }

    const menu = notificationsMenuRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsNotificationsOpen(false);
        notificationsButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    menu.addEventListener("keydown", onKeyDown);
    return () => menu.removeEventListener("keydown", onKeyDown);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isProfileOpen || !profileMenuRef.current) {
      return undefined;
    }

    const menu = profileMenuRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsProfileOpen(false);
        profileButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    menu.addEventListener("keydown", onKeyDown);
    return () => menu.removeEventListener("keydown", onKeyDown);
  }, [isProfileOpen]);

  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileSearchOpen]);

  const handleLogout = useCallback(() => {
    logout();
    dispatch(clearAuth());
    navigate(appRoutes.login, { replace: true });
  }, [dispatch, logout, navigate]);

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedQuery = searchQuery.trim().toLowerCase();

      if (!normalizedQuery) {
        return;
      }

      const match = SEARCH_TARGETS.find((item) =>
        item.label.toLowerCase().includes(normalizedQuery)
      );

      navigate(match?.path || appRoutes.dashboard);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    },
    [navigate, searchQuery]
  );

  return (
    <>
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />
          <div
            className="relative w-full animate-slide-up bg-white shadow-hard dark:bg-slate-900"
            ref={mobileSearchRef}
          >
            <div className="flex items-center justify-between border-b border-surface-border p-4">
              <div className="flex-1">
                <form className="relative w-full" onSubmit={handleSearch}>
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    className="form-input w-full pl-10"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search trips, payroll, stores..."
                    type="search"
                    value={searchQuery}
                  />
                </form>
              </div>
              <button
                aria-label="Close search"
                className="ml-4 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsMobileSearchOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 h-header border-b border-surface-border bg-white/92 backdrop-blur-md dark:bg-slate-900/92">
        <div className="flex h-full items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            {!isDesktop && onToggleSidebar && (
              <button
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
                onClick={onToggleSidebar}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {isDesktop && (
              <div className="flex items-center gap-3">
                <button
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={onToggleSidebarCollapse}
                  type="button"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  aria-label="Go to dashboard"
                  className="flex items-center gap-2 text-left"
                  onClick={() => navigate(appRoutes.dashboard)}
                  type="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-white shadow-sm">
                    S
                  </div>
                  {!sidebarCollapsed && (
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-app-primary">SEMKO</p>
                      <p className="text-xs text-app-muted">Integrated Management</p>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {isDesktop && (
            <div className="min-w-0 flex-1">
              <form className="relative mx-auto w-full max-w-2xl" onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="form-input w-full pl-10"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search trips, stores, fuel, payroll..."
                  type="search"
                  value={searchQuery}
                />
              </form>
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isDesktop && (
              <button
                aria-label="Search"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
                onClick={() => setIsMobileSearchOpen((current) => !current)}
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            <button
              aria-label="Help"
              className="hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:flex"
              onClick={() => navigate(appRoutes.support)}
              type="button"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                id="notifications-button"
                aria-controls="header-notifications-menu"
                {...(isNotificationsOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
                aria-haspopup="menu"
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsNotificationsOpen((current) => !current);
                  setIsProfileOpen(false);
                }}
                ref={notificationsButtonRef}
                type="button"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 inline-flex items-center justify-center">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className="fixed right-4 top-16 z-50 mt-2 w-[calc(100vw-1.5rem)] animate-scale-in rounded-2xl border border-surface-border bg-white shadow-hard dark:bg-slate-900 md:absolute md:right-0 md:top-full md:w-96"
                  id="header-notifications-menu"
                  ref={notificationsMenuRef}
                  role="dialog"
                  aria-labelledby="notifications-button"
                  tabIndex={-1}
                >
                  <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-app-primary">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-accent-100 px-2 py-1 text-xs text-accent-800 dark:bg-accent-900 dark:text-accent-100">
                          {unreadCount} new
                        </span>
                      )}
                      <button
                        className="text-xs text-accent-600 hover:underline dark:text-accent-300"
                        onClick={() => navigate(appRoutes.notifications)}
                        type="button"
                      >
                        View all
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto md:max-h-80">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notification) => (
                          <button
                            className={cn(
                              "w-full p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                              notification.status !== "read" &&
                                "bg-accent-50/60 dark:bg-accent-900/10"
                            )}
                            key={notification.id}
                            onClick={() => {
                              navigate(appRoutes.notifications);
                              setIsNotificationsOpen(false);
                            }}
                            type="button"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex-shrink-0 rounded-lg bg-accent-100 p-2 text-accent-700 dark:bg-accent-900 dark:text-accent-200">
                                <Inbox className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-sm font-medium text-app-primary">
                                  {notification.title || "System notification"}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-app-secondary">
                                  {notification.message || "You have a new SEMKO update."}
                                </p>
                                {notification.created_at && (
                                  <p className="mt-2 text-xs text-app-muted">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              {notification.status !== "read" && (
                                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Inbox className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                        <p className="text-sm text-app-secondary">No notifications yet</p>
                        <p className="mt-1 text-xs text-app-muted">You are all caught up.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={profileRef}>
              <button
                id="profile-button"
                aria-controls="header-profile-menu"
                {...(isProfileOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
                aria-haspopup="menu"
                aria-label="Profile menu"
                className="group flex items-center gap-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsProfileOpen((current) => !current);
                  setIsNotificationsOpen(false);
                }}
                ref={profileButtonRef}
                type="button"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-white shadow-md transition-shadow group-hover:shadow-lg">
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 transition-transform duration-200 sm:block",
                    isProfileOpen && "rotate-180"
                  )}
                />
              </button>

              {isProfileOpen && (
                <div
                  className="fixed right-4 top-16 z-50 mt-2 w-[calc(100vw-1.5rem)] animate-scale-in rounded-2xl border border-surface-border bg-white shadow-hard dark:bg-slate-900 md:absolute md:right-0 md:top-full md:w-72"
                  id="header-profile-menu"
                  ref={profileMenuRef}
                  role="dialog"
                  aria-labelledby="profile-button"
                  tabIndex={-1}
                >
                  <div className="border-b border-surface-border px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-md">
                        {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-app-primary">
                          {user?.first_name || user?.username || "SEMKO User"}
                        </p>
                        <p className="truncate text-xs text-app-muted">{user?.email}</p>
                        <p className="mt-1 text-xs text-accent-600 dark:text-accent-300">
                          {user?.role?.name || "Authenticated session"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => {
                        navigate(appRoutes.profile);
                        setIsProfileOpen(false);
                      }}
                      type="button"
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>My profile</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => {
                        navigate(appRoutes.changePassword);
                        setIsProfileOpen(false);
                      }}
                      type="button"
                    >
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span>Change password</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => {
                        navigate(appRoutes.settings);
                        setIsProfileOpen(false);
                      }}
                      type="button"
                    >
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-surface-border py-2">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-black/20 dark:bg-black/40 md:hidden"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </>
  );
}
