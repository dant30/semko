// frontend/src/shared/components/layout/AppHeader.tsx
import { HelpCircle, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/core/contexts/useTheme";
import { appRoutes } from "@/core/constants/routes";
import { IconButton, SearchInput } from "@/shared/components/ui";
import { NotificationDropdown } from "@/features/notifications/components/NotificationDropdown";
import { ProfileDropdown } from "@/features/auth/components/ProfileDropdown";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

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
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);


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
              <form className="mx-auto w-full max-w-2xl" onSubmit={handleSearch}>
                <SearchInput
                  className="w-full"
                  placeholder="Search trips, stores, fuel, payroll..."
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </form>
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isDesktop && (
              <IconButton
                aria-label="Search"
                icon={<Search className="h-5 w-5" />}
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileSearchOpen((current) => !current)}
                type="button"
              />
            )}

            <IconButton
              aria-label="Help"
              icon={<HelpCircle className="h-5 w-5" />}
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              onClick={() => navigate(appRoutes.support)}
              type="button"
            />

            <NotificationDropdown />

            <IconButton
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              icon={isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              type="button"
            />

            <ProfileDropdown />
          </div>
        </div>
      </header>

    </>
  );
}
