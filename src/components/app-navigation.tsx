"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  Menu,
  LayoutDashboard,
  Tv,
  Book,
  BookOpen,
  History,
  Library,
  List,
  HandHelping,
  ThumbsUp,
  BarChart2,
  Settings,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useNavigation } from "~/hooks/use-navigation";
import { DesktopNavMenus } from "~/components/desktop-nav-menus";
import { NavUserMenu } from "~/components/nav-user-menu";
import { MobileNavMenu } from "~/components/mobile-nav-menu";
import { UnifiedSearchDialog } from "~/components/unified-search-dialog";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import type { Session } from "next-auth";

// Navigation items grouped by category (for reference/consistency)
const navigationItems = [
  // Primary: Always visible
  {
    href: "/",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  // Media Discovery Group
  {
    href: "/movies",
    name: "Movies",
    icon: Film,
  },
  {
    href: "/tv-shows",
    name: "TV Shows",
    icon: Tv,
  },
  {
    href: "/books",
    name: "Books",
    icon: Book,
  },
  {
    href: "/bible",
    name: "Bible",
    icon: BookOpen,
  },
  // My Library Group
  {
    href: "/watches",
    name: "Watch History",
    icon: History,
  },
  {
    href: "/collection",
    name: "Library",
    icon: Library,
  },
  // Lists
  {
    href: "/lists",
    name: "Lists",
    icon: List,
  },
  // Secondary: In More dropdown
  {
    href: "/loans",
    name: "Loans",
    icon: HandHelping,
  },
  {
    href: "/recommendations",
    name: "Recommendations",
    icon: ThumbsUp,
  },
  {
    href: "/statistics",
    name: "Statistics",
    icon: BarChart2,
  },
  {
    href: "/settings",
    name: "Settings",
    icon: Settings,
  },
];

interface AppNavigationProps {
  readonly user?: Session["user"];
}

export function AppNavigation({ user }: AppNavigationProps) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen, mounted } = useNavigation();

  if (!user) {
    return null;
  }

  const isNavigationItemActive = (itemHref: string) => {
    if (pathname === itemHref) return true;

    if (itemHref === "/") return false;

    const sortedItems = [...navigationItems].sort(
      (a, b) => b.href.length - a.href.length,
    );

    const matchingItem = sortedItems.find((item) => {
      if (item.href === "/") return pathname === "/";
      return (
        pathname === item.href ||
        (pathname.startsWith(item.href) &&
          (pathname[item.href.length] === "/" ||
            pathname[item.href.length] === undefined))
      );
    });

    return matchingItem?.href === itemHref;
  };

  const libraryItems = navigationItems.filter((item) =>
    ["/watches", "/collection"].includes(item.href),
  );
  const listItems = navigationItems.filter((item) =>
    ["/lists"].includes(item.href),
  );
  const featureItems = navigationItems.filter((item) =>
    ["/loans", "/recommendations", "/statistics"].includes(item.href),
  );

  const isGroupActive = (items: typeof navigationItems) =>
    items.some((item) => isNavigationItemActive(item.href));

  return (
    <>
      <nav className="bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Film className="h-6 w-6" />
              <span className="text-xl font-bold">Trackerr</span>
            </Link>

            <div className="max-md:hidden">
              <DesktopNavMenus
                isActive={isNavigationItemActive}
                isGroupActive={isGroupActive}
              />
            </div>

            <div className="max-sm:hidden">
              <UnifiedSearchDialog />
            </div>

            <div className="flex items-center space-x-2">
              <NavUserMenu mounted={mounted} user={user} />

              <Button
                variant="outline"
                size="sm"
                className="bg-secondary/50 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Navigation Menu"
              >
                <Menu className="h-5 w-5" />
                <span className="ml-2 text-xs">Menu</span>
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <MobileNavMenu
              isActive={isNavigationItemActive}
              isGroupActive={isGroupActive}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </nav>

      <MobileBottomNav
        isActive={isNavigationItemActive}
        onMoreClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMoreOpen={isMobileMenuOpen}
      />
    </>
  );
}
