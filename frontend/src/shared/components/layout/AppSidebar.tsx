// frontend/src/shared/components/layout/AppSidebar.tsx
import {
  Bell,
  Boxes,
  ChartColumn,
  ChevronDown,
  Coins,
  Fuel,
  Gauge,
  LayoutDashboard,
  Shield,
  Truck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { useAppSelector } from "@/core/store/hooks";
import { Button, IconButton } from "@/shared/components/ui";
import {
  governanceNavigation,
  mainNavigation,
  masterDataNavigation,
  prefetchRoute,
} from "@/core/router/route-config";
import type { NavItem } from "@/core/types/common";
import { cn } from "@/shared/utils/classnames";

interface AppSidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  collapsed?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  bell: Bell,
  boxes: Boxes,
  chart: ChartColumn,
  droplet: Fuel,
  grid: LayoutDashboard,
  route: Truck,
  shield: Shield,
  user: Users,
  users: UserCog,
  vehicle: Truck,
  wallet: Coins,
  wrench: Wrench,
};

function getNavIcon(icon?: string) {
  const Icon = icon ? iconMap[icon] : Gauge;
  return <Icon className="h-4 w-4" />;
}

function filterItemsByPermissions(items: NavItem[], userPermissions: string[]) {
  return items
    .filter((item) => hasAnyPermission(userPermissions, item.requiredPermissions))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) =>
        hasAnyPermission(userPermissions, child.requiredPermissions)
      ),
    }));
}

function isPathActive(currentPath: string, item: NavItem) {
  if (item.path === "/app/dashboard") {
    return currentPath === item.path;
  }
  return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
}

function SidebarSection({
  items,
  onNavigate,
  title,
  collapsed = false,
  userPermissions,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  title: string;
  collapsed?: boolean;
  userPermissions: string[];
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    items
      .filter((item) =>
        item.children?.some((child) => isPathActive(location.pathname, child))
      )
      .map((item) => item.path)
  );

  const visibleItems = useMemo(
    () => filterItemsByPermissions(items, userPermissions),
    [items, userPermissions]
  );

  useEffect(() => {
    const shouldBeExpanded = visibleItems
      .filter((item) =>
        item.children?.some((child) => isPathActive(location.pathname, child))
      )
      .map((item) => item.path);

    setExpandedItems((current) =>
      Array.from(new Set([...current, ...shouldBeExpanded]))
    );
  }, [location.pathname, visibleItems]);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!collapsed && (
        <span className="block px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
      )}
      <nav className="grid gap-1">
        {visibleItems.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const active = isPathActive(location.pathname, item);
          const expanded = expandedItems.includes(item.path);

          return (
            <div key={item.path}>
              {hasChildren ? (
                <>
                  <button
                    className={cn(
                      "group relative flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center",
                      active
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                    )}
                    onClick={() => {
                      if (collapsed) {
                        const firstChild = item.children?.[0];
                        if (firstChild) {
                          navigate(firstChild.path);
                          onNavigate?.();
                        }
                      } else {
                        setExpandedItems((current) =>
                          current.includes(item.path)
                            ? current.filter((path) => path !== item.path)
                            : [...current, item.path]
                        );
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    type="button"
                  >
                    <span className={cn("flex items-center", !collapsed && "mr-3")}>
                      {getNavIcon(item.icon)}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expanded && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && expanded && (
                    <div className="mt-1 ml-6 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                      {item.children?.map((child) => (
                        <NavLink
                          className={({ isActive }) =>
                            cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors",
                              isActive || isPathActive(location.pathname, child)
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                            )
                          }
                          key={`${child.path}-${child.label}`}
                          onClick={onNavigate}
                          onMouseEnter={() => prefetchRoute(child.path)}
                          onFocus={() => prefetchRoute(child.path)}
                          to={child.path}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                    )
                  }
                  onClick={onNavigate}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  onFocus={() => prefetchRoute(item.path)}
                  title={collapsed ? item.label : undefined}
                  to={item.path}
                >
                  <span className={cn("flex items-center", !collapsed && "mr-3")}>
                    {getNavIcon(item.icon)}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar({ onClose, onNavigate, collapsed = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userPermissions = getUserPermissions(user);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header area – responsive with close button on mobile */}
      {onClose && (
        <div
          className={cn(
            "flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700 lg:hidden",
            collapsed && "px-2"
          )}
        >
          <Button
            variant="ghost"
            className="flex items-center gap-3 p-0 text-slate-900 dark:text-white"
            onMouseEnter={() => prefetchRoute("/app/dashboard")}
            onFocus={() => prefetchRoute("/app/dashboard")}
            onClick={() => {
              navigate("/app/dashboard");
              onNavigate?.();
            }}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-white shadow-md">
              S
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">SEMKO</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Operations</p>
              </div>
            )}
          </Button>
          <IconButton
            icon={<X className="h-5 w-5" />}
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-300"
            onClick={onClose}
            aria-label="Close sidebar"
            type="button"
          />
        </div>
      )}

      {/* Desktop header (expanded) */}
      {!onClose && !collapsed && (
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-700">
          <Button
            variant="ghost"
            className="flex items-center gap-3 p-0 text-slate-900 dark:text-white"
            onMouseEnter={() => prefetchRoute("/app/dashboard")}
            onFocus={() => prefetchRoute("/app/dashboard")}
            onClick={() => navigate("/app/dashboard")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-white shadow-md">
              S
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">SEMKO</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operations</p>
            </div>
          </Button>
        </div>
      )}

      {/* Desktop header (collapsed) */}
      {!onClose && collapsed && (
        <div className="flex h-16 items-center justify-center border-b border-slate-200 px-2 dark:border-slate-700">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onMouseEnter={() => prefetchRoute("/app/dashboard")}
            onFocus={() => prefetchRoute("/app/dashboard")}
            onClick={() => navigate("/app/dashboard")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-white shadow-md">
              S
            </div>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto py-4" id="app-sidebar">
        <div className="space-y-6">
          <SidebarSection
            items={mainNavigation}
            onNavigate={onNavigate}
            title="Main"
            collapsed={collapsed}
            userPermissions={userPermissions}
          />
          <SidebarSection
            items={masterDataNavigation}
            onNavigate={onNavigate}
            title="Master Data"
            collapsed={collapsed}
            userPermissions={userPermissions}
          />
          <SidebarSection
            items={governanceNavigation}
            onNavigate={onNavigate}
            title="Governance"
            collapsed={collapsed}
            userPermissions={userPermissions}
          />
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 border-t border-slate-200 px-4 py-3 dark:border-slate-700",
          collapsed && "px-2 text-center"
        )}
      >
        {!collapsed && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Focused navigation for daily operations.
          </p>
        )}
        {collapsed && <p className="text-xs text-slate-500 dark:text-slate-400">SEMKO</p>}
      </div>
    </div>
  );
}