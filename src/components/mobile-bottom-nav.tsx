"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, Library, List, Menu } from "lucide-react";
import { cn } from "~/lib/utils";

interface MobileBottomNavProps {
  readonly isActive: (href: string) => boolean;
  readonly onMoreClick: () => void;
  readonly isMoreOpen: boolean;
}

const bottomNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movies", label: "Media", icon: Film },
  { href: "/watchlist", label: "My Library", icon: Library },
  { href: "/lists", label: "Lists", icon: List },
];

export function MobileBottomNav({
  isActive,
  onMoreClick,
  isMoreOpen,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background/95 supports-backdrop-filter:bg-background/60 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMoreClick}
          aria-expanded={isMoreOpen}
          aria-label="Open more navigation items"
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 text-xs",
            isMoreOpen || pathname.startsWith("/settings")
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
}
