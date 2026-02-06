"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Bookmark,
  Archive,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  BarChart2,
  Film,
  Tv,
  Book,
  History,
  Library,
  List,
  HandHelping,
  ThumbsUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

// Define strict structure for items
interface NavItem {
  href: string;
  name: string;
  icon: React.ElementType;
}

const topLevelItems: NavItem[] = [
  { href: "/", name: "Dashboard", icon: LayoutDashboard },
];

const mediaDiscoveryItems: NavItem[] = [
  { href: "/movies", name: "Movies", icon: Film },
  { href: "/tv-shows", name: "TV Shows", icon: Tv },
  { href: "/books", name: "Books", icon: Book },
  { href: "/bible", name: "Bible", icon: Book },
];

const myLibraryItems: NavItem[] = [
  { href: "/watches", name: "Watch History", icon: History },
  { href: "/collection", name: "Library", icon: Library },
];

const listItems: NavItem[] = [
  { href: "/movies/watchlist", name: "Watchlist", icon: Bookmark },
  { href: "/books/wishlist", name: "Book Wishlist", icon: Bookmark },
  { href: "/movies/favorites", name: "Favorites", icon: Heart },
  { href: "/lists", name: "Custom Lists", icon: List },
];

const moreItems: NavItem[] = [
  { href: "/loans", name: "Loans", icon: HandHelping },
  { href: "/recommendations", name: "Recommendations", icon: ThumbsUp },
  { href: "/statistics", name: "Statistics", icon: BarChart2 },
];

interface DesktopNavMenusProps {
  readonly isActive: (href: string) => boolean;
  readonly isGroupActive: (items: any[]) => boolean;
}

export function DesktopNavMenus({
  isActive,
}: DesktopNavMenusProps) {
  const pathname = usePathname();

  // Helper to check if any item in a list is active (for dropdown highlighting)
  const isAnyActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href));
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Top Level Items */}
      {topLevelItems.map((item) => {
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
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Button>
          </Link>
        );
      })}

      {/* Media Discovery Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isAnyActive(mediaDiscoveryItems) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isAnyActive(mediaDiscoveryItems) && "bg-secondary",
            )}
            aria-label="Media discovery menu"
          >
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {mediaDiscoveryItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* My Library Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isAnyActive(myLibraryItems) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isAnyActive(myLibraryItems) && "bg-secondary",
            )}
            aria-label="My library menu"
          >
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">My Library</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {myLibraryItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lists Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={
              isAnyActive(listItems) ||
              pathname.startsWith("/movies/watchlist") ||
              pathname.startsWith("/books/wishlist") ||
              pathname.startsWith("/movies/favorites")
                ? "secondary"
                : "ghost"
            }
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              (isAnyActive(listItems) ||
                pathname.startsWith("/movies/watchlist") ||
                pathname.startsWith("/books/wishlist") ||
                pathname.startsWith("/movies/favorites")) &&
                "bg-secondary",
            )}
            aria-label="Lists menu"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lists</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {listItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isAnyActive(moreItems) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isAnyActive(moreItems) && "bg-secondary",
            )}
            aria-label="More menu"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {moreItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
