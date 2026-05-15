"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/store/ui-store";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/meetings": "Meetings",
  "/dashboard/meetings/new": "New Meeting",
  "/dashboard/action-items": "Action Items",
  "/dashboard/search": "Search",
  "/dashboard/templates": "Templates",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/playground": "Playground",
  "/dashboard/chat": "Chat",
};

function getBreadcrumbs(pathname: string) {
  if (pathname === "/dashboard") return [{ label: "Dashboard", href: "/dashboard" }];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Dashboard", href: "/dashboard" }];

  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = breadcrumbMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export function Topbar() {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useUIStore();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <nav className="flex items-center text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center">
              {i > 0 && <ChevronRight className="mx-1.5 h-4 w-4 text-muted-foreground" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Search + Notifications + Theme + User */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button variant="ghost" className="hidden md:flex h-9 items-center gap-2 text-muted-foreground border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="pointer-events-none ml-4 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>

        {/* Mobile search */}
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
