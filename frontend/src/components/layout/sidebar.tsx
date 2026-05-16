"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  LayoutDashboard,
  Calendar,
  Plus,
  CheckSquare,
  Search,
  Layout,
  BarChart3,
  Settings2,
  Wand2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { currentUser } from "@/lib/mock-data";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  { label: "New Meeting", href: "/dashboard/meetings/new", icon: Plus, accent: true },
  { label: "Action Items", href: "/dashboard/action-items", icon: CheckSquare },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "Templates", href: "/dashboard/templates", icon: Layout },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Playground", href: "/dashboard/playground", icon: Wand2 },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings2 },
];

function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Mic className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden text-lg font-bold tracking-tight"
            >
              MeetAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.role}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.accent) {
            return (
              <Link key={item.href} href={item.href}>
                <Button className="w-full justify-start gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setMobileSidebarOpen } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground relative"
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarMobileOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
