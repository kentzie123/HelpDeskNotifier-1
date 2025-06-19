import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Home,
  Ticket,
  Bell,
  Users,
  BarChart3,
  Book,
  Settings,
  Headphones,
} from "lucide-react";
import type { Ticket as TicketType } from "@shared/schema";

const getNavigationItems = (ticketCount: number, unreadCount: number) => [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Tickets", href: "/tickets", icon: Ticket, badge: ticketCount > 0 ? ticketCount.toString() : undefined },
  { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount.toString() : undefined },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Knowledge Base", href: "/knowledge-base", icon: Book },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const { data: tickets = [] } = useQuery<TicketType[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: unreadData } = useQuery<{count: number}>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const navigationItems = getNavigationItems(tickets.length, unreadData?.count || 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <Headphones className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-sidebar-foreground">
                HelpDesk
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-sidebar-primary bg-sidebar-primary/10"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">JD</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">
                  John Doe
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
