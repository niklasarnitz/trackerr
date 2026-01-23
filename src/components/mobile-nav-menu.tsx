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
  { href: "/statistics", name: "Statistics", icon: BarChart2 },
  { href: "/movies", name: "Movies", icon: Film },
  { href: "/tv-shows", name: "TV Shows", icon: Tv },
  { href: "/books", name: "Books", icon: Book },
];

const libraryItems: NavItem[] = [
  { href: "/collection", name: "Collection", icon: Library },
  { href: "/watches", name: "History", icon: History },
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
];

interface MobileNavMenuProps {
  readonly isActive: (href: string) => boolean;
  readonly isGroupActive: (items: any[]) => boolean;
  readonly onClose: () => void;
}

export function MobileNavMenu({
  isActive,
  onClose,
}: MobileNavMenuProps) {
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
          {/* Library Section */}
          <AccordionItem value="library" className="border-b-0">
            <AccordionTrigger className={cn(
               "flex w-full items-center justify-between py-2 px-3 hover:no-underline hover:bg-muted/50 rounded-md",
               isAnyActive(libraryItems) && "bg-secondary text-secondary-foreground"
            )}>
              <div className="flex items-center space-x-2">
                <Archive className="h-4 w-4" />
                <span className="text-sm font-medium">Library</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
              <div className="flex flex-col space-y-1 pl-6">
                {libraryItems.map((item) => {
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
            <AccordionTrigger className={cn(
               "flex w-full items-center justify-between py-2 px-3 hover:no-underline hover:bg-muted/50 rounded-md",
               (isAnyActive(listItems) || pathname.startsWith("/movies/watchlist") || pathname.startsWith("/books/wishlist") || pathname.startsWith("/movies/favorites")) && "bg-secondary text-secondary-foreground"
            )}>
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">Lists</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
              <div className="flex flex-col space-y-1 pl-6">
                {listItems.map((item) => {
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
            <AccordionTrigger className={cn(
               "flex w-full items-center justify-between py-2 px-3 hover:no-underline hover:bg-muted/50 rounded-md",
               isAnyActive(moreItems) && "bg-secondary text-secondary-foreground"
            )}>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">More</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
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
