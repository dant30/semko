import { ArrowUp } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { Footer } from "./Footer";

function InlineContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg ui-skeleton" />
      <div className="h-6 w-64 rounded-lg ui-skeleton" />
      <div className="h-72 rounded-2xl ui-skeleton" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
}

const DESKTOP_QUERY = "(min-width: 1024px)";
const SCROLL_THRESHOLD = 300;

export function AppLayout() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!mobileSidebarOpen || !mobileDrawerRef.current) {
      return undefined;
    }

    const drawer = mobileDrawerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>(focusableSelector)
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleTrap = (event: KeyboardEvent) => {
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

    drawer.addEventListener("keydown", handleTrap);
    return () => drawer.removeEventListener("keydown", handleTrap);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-shell">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-700 focus:shadow-lg"
        href="#main-content"
      >
        Skip to main content
      </a>

      <AppHeader 
        onToggleSidebar={() => setMobileSidebarOpen((current) => !current)}
        onToggleSidebarCollapse={() => setSidebarCollapsed((current) => !current)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isDesktop && (
          <div className={`min-h-0 shrink-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-16' : 'w-sidebar'
          }`}>
            <aside className="h-full w-full border-r border-surface-border bg-white/75 backdrop-blur dark:bg-slate-950/70">
              <AppSidebar 
                collapsed={sidebarCollapsed}
                onClose={() => setMobileSidebarOpen(false)}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        <div
          className={`fixed inset-0 z-[60] lg:hidden ${
            mobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <button
            aria-label="Close sidebar backdrop"
            className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-200 ease-out ${
              mobileSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileSidebarOpen(false)}
            type="button"
          />

          <div
            aria-label="Navigation"
            aria-modal="true"
            className={`relative z-10 h-full w-sidebar max-w-[88vw] transform-gpu transition-transform duration-200 ease-out ${
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            ref={mobileDrawerRef}
            role="dialog"
          >
            <aside className="h-full border-r border-surface-border bg-white dark:bg-slate-950">
              <AppSidebar
                onClose={() => setMobileSidebarOpen(false)}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        </div>

        <main
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent"
          id="main-content"
        >
          <div className="container-fluid mx-auto w-full max-w-[1520px] py-2 sm:py-4 lg:py-6">
            <Suspense fallback={<InlineContentSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
          <Footer />
        </main>

        {showBackToTop && (
          <Button
            aria-label="Back to top"
            className="fixed bottom-4 right-4 z-50 rounded-full px-3 shadow-lg sm:bottom-6 sm:right-6 sm:px-4"
            onClick={scrollToTop}
            size="sm"
            type="button"
          >
            <ArrowUp className="h-4 w-4" />
            Top
          </Button>
        )}
      </div>
    </div>
  );
}
