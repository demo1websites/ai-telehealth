import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, LogOut, Menu, X, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  badge?: string | number;
  isActive?: boolean;
}

export interface SidebarProfile {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
}

interface DashboardLayoutProps {
  title: string;
  sidebarItems: SidebarItem[];
  sidebarProfile?: SidebarProfile;
  children: React.ReactNode;
}

const DashboardLayout = ({ title, sidebarItems, sidebarProfile, children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) item.onClick();
    else if (item.path) navigate(item.path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar-background transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">MediConnect</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Profile card */}
        {sidebarProfile && (
          <div className="border-b border-sidebar-border px-4 py-4">
            <div className="flex items-center gap-3">
              {sidebarProfile.avatarUrl ? (
                <img
                  src={sidebarProfile.avatarUrl}
                  alt={sidebarProfile.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">{sidebarProfile.name}</p>
                <p className="truncate text-xs text-muted-foreground">{sidebarProfile.subtitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {sidebarItems.map((item) => {
            const isActive = item.isActive || (item.path && location.pathname === item.path);
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
