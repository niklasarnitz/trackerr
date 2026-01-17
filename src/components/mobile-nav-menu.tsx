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

interface MobileNavMenuProps {
  readonly isActive: (href: string) => boolean;
  readonly isGroupActive: (items: typeof navigationItems) => boolean;
  readonly onClose: () => void;
}

export function MobileNavMenu({
  isActive,
  isGroupActive,
  onClose,
}: MobileNavMenuProps) {
  const pathname = usePathname();

  const desktopPrimaryItems = navigationItems.filter(
    (item) =>
      item.href === "/" ||
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
    <div className="border-t py-4 md:hidden">
      <div className="grid gap-2">
        {desktopPrimaryItems.map((item) => {
          const isItemActive = isActive(item.href);

          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <Button
                variant={isItemActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex w-full items-center justify-start space-x-2",
                  isItemActive && "bg-secondary",
                )}
              >
                <span>{item.name}</span>
              </Button>
            </Link>
          );
        })}

        {/* My Lists */}
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
                "flex w-full items-center justify-start space-x-2",
                (pathname.startsWith("/movies/watchlist") ||
                  pathname.startsWith("/movies/favorites")) &&
                  "bg-secondary",
              )}
              aria-label="My Lists menu"
            >
              <Heart className="h-4 w-4" />
              <span>My Lists</span>
              <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
            {myListsItems.map((item) => {
              const Icon = item.icon as typeof Heart | null;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} onClick={onClose}>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Library */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isGroupActive(libraryItems) ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "flex w-full items-center justify-start space-x-2",
                isGroupActive(libraryItems) && "bg-secondary",
              )}
              aria-label="Library menu"
            >
              <Archive className="h-4 w-4" />
              <span>Library</span>
              <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
            {libraryItems.map((item) => {
              const Icon = item.icon as typeof Heart | null;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} onClick={onClose}>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Features */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isGroupActive(featureItems) ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "flex w-full items-center justify-start space-x-2",
                isGroupActive(featureItems) && "bg-secondary",
              )}
              aria-label="More features menu"
            >
              <Sparkles className="h-4 w-4" />
              <span>More</span>
              <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
            {featureItems.map((item) => {
              const Icon = item.icon as typeof Heart | null;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} onClick={onClose}>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
