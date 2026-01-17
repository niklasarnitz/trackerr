"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "~/lib/utils";
import { useNavigation } from "~/hooks/use-navigation";
import { DesktopNavMenus } from "~/components/desktop-nav-menus";
import { NavUserMenu } from "~/components/nav-user-menu";
import { MobileNavMenu } from "~/components/mobile-nav-menu";

const navigationItems = [
  {
    href: "/",
    name: "Dashboard",
    icon: null,
  },
  {
    href: "/movies",
    name: "Movies",
    icon: null,
  },
  {
    href: "/tv-shows",
    name: "TV Shows",
    icon: null,
  },
  {
    href: "/books",
    name: "Books",
    icon: null,
  },
  {
    href: "/watches",
    name: "History",
    icon: null,
  },
  {
    href: "/collection",
    name: "Collection",
    icon: null,
  },
  {
    href: "/lists",
    name: "Lists",
    icon: null,
  },
  {
    href: "/loans",
    name: "Loans",
    icon: null,
  },
  {
    href: "/recommendations",
    name: "Recommendations",
    icon: null,
  },
];

function NavigationContent() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobileMenuOpen, setIsMobileMenuOpen, mounted } = useNavigation();

  // Don't render navigation if user is not logged in
  if (!session?.user) {
    return null;
  }

  // Function to determine if a navigation item is active
  const isNavigationItemActive = (itemHref: string) => {
    // Exact match
    if (pathname === itemHref) return true;

    // For the root path, only match exactly
    if (itemHref === "/") return false;

    // Find the most specific matching route
    // Sort navigation items by href length (longest first) to prioritize more specific routes
    const sortedItems = [...navigationItems].sort(
      (a, b) => b.href.length - a.href.length,
    );

    // Find the first (most specific) item that matches
    const matchingItem = sortedItems.find((item) => {
      if (item.href === "/") return pathname === "/";
      return (
        pathname === item.href ||
        (pathname.startsWith(item.href) &&
          (pathname[item.href.length] === "/" ||
            pathname[item.href.length] === undefined))
      );
    });

    // Return true only if this is the matching item
    return matchingItem?.href === itemHref;
  };

  const libraryItems = navigationItems.filter((item) =>
    ["/watches", "/collection"].includes(item.href),
  );
  const featureItems = navigationItems.filter((item) =>
    ["/lists", "/loans", "/recommendations"].includes(item.href),
  );

  const isGroupActive = (items: typeof navigationItems) =>
    items.some((item) => isNavigationItemActive(item.href));

  return (
    <nav className="bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6" />
            <span className="text-xl font-bold">Trackerr</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="max-md:hidden">
            <DesktopNavMenus
              isActive={isNavigationItemActive}
              isGroupActive={isGroupActive}
            />
          </div>

          {/* User Menu & Mobile Button */}
          <div className="flex items-center space-x-2">
            <NavUserMenu mounted={mounted} />

            {/* Mobile Menu Button */}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <MobileNavMenu
            isActive={isNavigationItemActive}
            isGroupActive={isGroupActive}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  );
}

export function Navigation() {
  return <NavigationContent />;
}
