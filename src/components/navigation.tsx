"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  BarChart3,
  Film,
  BookOpen,
  Eye,
  Archive,
  User,
  LogOut,
  Menu,
  Moon,
  Sun,
  Settings,
  Bookmark,
  Heart,
  List,
  Handshake,
  Target,
  Bell,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";

const navigationItems = [
  {
    href: "/",
    name: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/movies",
    name: "Movies",
    icon: Film,
  },
  {
    href: "/books",
    name: "Books",
    icon: BookOpen,
  },
  {
    href: "/movies/watchlist",
    name: "Watchlist",
    icon: Bookmark,
  },
  {
    href: "/movies/favorites",
    name: "Favorites",
    icon: Heart,
  },
  {
    href: "/watches",
    name: "History",
    icon: Eye,
  },
  {
    href: "/collection",
    name: "Collection",
    icon: Archive,
  },
  {
    href: "/lists",
    name: "Lists",
    icon: List,
  },
  {
    href: "/loans",
    name: "Loans",
    icon: Handshake,
  },
  {
    href: "/reminders",
    name: "Reminders",
    icon: Bell,
  },
  {
    href: "/recommendations",
    name: "Recommendations",
    icon: Sparkles,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

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

  const desktopPrimaryItems = navigationItems.filter(
    (item) =>
      item.href === "/" || item.href === "/movies" || item.href === "/books",
  );
  const libraryItems = navigationItems.filter((item) =>
    [
      "/movies/watchlist",
      "/movies/favorites",
      "/watches",
      "/collection",
    ].includes(item.href),
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
          <div className="flex items-center space-x-1 max-md:hidden">
            {desktopPrimaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isGroupActive(libraryItems) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2",
                    isGroupActive(libraryItems) && "bg-secondary",
                  )}
                >
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Library</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isGroupActive(featureItems) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2",
                    isGroupActive(featureItems) && "bg-secondary",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Features</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {featureItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 p-0"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? ""}
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0)?.toUpperCase() ?? (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
          <div className="border-t py-4 md:hidden">
            <div className="grid gap-2">
              {desktopPrimaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex w-full items-center justify-start space-x-2",
                        isActive && "bg-secondary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={
                      isGroupActive(libraryItems) ? "secondary" : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "flex w-full items-center justify-start space-x-2",
                      isGroupActive(libraryItems) && "bg-secondary",
                    )}
                  >
                    <Archive className="h-4 w-4" />
                    <span>Library</span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[calc(100vw-2rem)]"
                >
                  {libraryItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={
                      isGroupActive(featureItems) ? "secondary" : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "flex w-full items-center justify-start space-x-2",
                      isGroupActive(featureItems) && "bg-secondary",
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Features</span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[calc(100vw-2rem)]"
                >
                  {featureItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
