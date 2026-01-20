"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Bookmark, Archive, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

const navigationItems = [
  {
    href: "/",
    name: "Dashboard",
    icon: null,
  },
  {
    href: "/statistics",
    name: "Statistics",
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

interface DesktopNavMenusProps {
  readonly isActive: (href: string) => boolean;
  readonly isGroupActive: (items: typeof navigationItems) => boolean;
}

export function DesktopNavMenus({
  isActive,
  isGroupActive,
}: DesktopNavMenusProps) {
  const pathname = usePathname();

  const desktopPrimaryItems = navigationItems.filter(
    (item) =>
      item.href === "/" ||
      item.href === "/statistics" ||
      item.href === "/movies" ||
      item.href === "/tv-shows" ||
      item.href === "/books",
  );

  const libraryItems = navigationItems.filter((item) =>
    ["/watches", "/collection"].includes(item.href),
  );

  const featureItems = navigationItems.filter((item) =>
    ["/lists", "/loans", "/recommendations"].includes(item.href),
  );

  const myListsItems = [
    { href: "/movies/watchlist", name: "Watchlist", icon: Bookmark },
    { href: "/movies/favorites", name: "Favorites", icon: Heart },
  ];

  return (
    <div className="flex items-center space-x-1">
      {desktopPrimaryItems.map((item) => {
        const isItemActive = isActive(item.href);

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isItemActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center space-x-2",
                isItemActive && "bg-secondary",
              )}
            >
              <span className="hidden sm:inline">{item.name}</span>
            </Button>
          </Link>
        );
      })}

      {/* My Lists Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={
              pathname.startsWith("/movies/watchlist") ||
              pathname.startsWith("/movies/favorites")
                ? "secondary"
                : "ghost"
            }
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              (pathname.startsWith("/movies/watchlist") ||
                pathname.startsWith("/movies/favorites")) &&
                "bg-secondary",
            )}
            aria-label="My Lists menu"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">My Lists</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {myListsItems.map((item) => {
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

      {/* Library Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isGroupActive(libraryItems) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isGroupActive(libraryItems) && "bg-secondary",
            )}
            aria-label="Library menu"
          >
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {libraryItems.map((item) => {
            const Icon = item.icon as typeof Heart | null;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More Features Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isGroupActive(featureItems) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isGroupActive(featureItems) && "bg-secondary",
            )}
            aria-label="More features menu"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {featureItems.map((item) => {
            const Icon = item.icon as typeof Heart | null;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
