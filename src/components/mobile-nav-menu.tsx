"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Bookmark,
  Archive,
  Sparkles,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";

// Define strict structure for items (mirroring desktop)
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

const watchlistItems: NavItem[] = [
  { href: "/watchlist", name: "All Watchlist", icon: Bookmark },
  { href: "/movies/watchlist", name: "Movies", icon: Film },
  { href: "/tv-shows", name: "TV Shows", icon: Tv },
  { href: "/books/wishlist", name: "Books", icon: Book },
  { href: "/movies/favorites", name: "Favorites", icon: Heart },
];

const customListItems: NavItem[] = [
  { href: "/lists", name: "Custom Lists", icon: List },
];

const moreItems: NavItem[] = [
  { href: "/loans", name: "Loans", icon: HandHelping },
  { href: "/recommendations", name: "Recommendations", icon: ThumbsUp },
  { href: "/statistics", name: "Statistics", icon: BarChart2 },
];

interface MobileNavMenuProps {
  readonly isActive: (href: string) => boolean;
  readonly isGroupActive: (items: any[]) => boolean;
  readonly onClose: () => void;
}

export function MobileNavMenu({ isActive, onClose }: MobileNavMenuProps) {
  const pathname = usePathname();

  // Helper to check if any item in a list is active (for accordion highlighting)
  const isAnyActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href));
  };

  return (
    <div className="border-t py-4 md:hidden">
      <div className="grid gap-1">
        {/* Top Level Items */}
        {topLevelItems.map((item) => {
          const isItemActive = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <Button
                variant={isItemActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex w-full items-center justify-start space-x-2 px-3",
                  isItemActive && "bg-secondary",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            </Link>
          );
        })}

        <Accordion type="multiple" className="w-full">
          {/* Media Discovery Section */}
          <AccordionItem value="media" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-3 py-2 hover:no-underline",
                isAnyActive(mediaDiscoveryItems) &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <div className="flex items-center space-x-2">
                <Film className="h-4 w-4" />
                <span className="text-sm font-medium">Media</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="flex flex-col space-y-1 pl-6">
                {mediaDiscoveryItems.map((item) => {
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* My Library Section */}
          <AccordionItem value="library" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-3 py-2 hover:no-underline",
                isAnyActive(myLibraryItems) &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <div className="flex items-center space-x-2">
                <Library className="h-4 w-4" />
                <span className="text-sm font-medium">My Library</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="flex flex-col space-y-1 pl-6">
                {myLibraryItems.map((item) => {
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Lists Section */}
          <AccordionItem value="lists" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-3 py-2 hover:no-underline",
                (isAnyActive(watchlistItems) ||
                  pathname.startsWith("/movies/watchlist") ||
                  pathname.startsWith("/books/wishlist") ||
                  pathname.startsWith("/movies/favorites") ||
                  pathname.startsWith("/watchlist")) &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <div className="flex items-center space-x-2">
                <Bookmark className="h-4 w-4" />
                <span className="text-sm font-medium">Watchlist</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="flex flex-col space-y-1 pl-6">
                {watchlistItems.map((item) => {
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custom Lists Section */}
          <AccordionItem value="custom-lists" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-3 py-2 hover:no-underline",
                isAnyActive(customListItems) &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">Lists</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="flex flex-col space-y-1 pl-6">
                {customListItems.map((item) => {
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* More Section */}
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-3 py-2 hover:no-underline",
                isAnyActive(moreItems) &&
                  "bg-secondary text-secondary-foreground",
              )}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">More</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="flex flex-col space-y-1 pl-6">
                {moreItems.map((item) => {
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
