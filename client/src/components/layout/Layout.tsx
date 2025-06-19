import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/tickets": "Tickets",
  "/notifications": "Notifications",
  "/users": "Users",
  "/reports": "Reports",
  "/knowledge-base": "Knowledge Base",
  "/settings": "Settings",
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const title = pageTitles[location] || "HelpDesk";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopNavigation
          onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
