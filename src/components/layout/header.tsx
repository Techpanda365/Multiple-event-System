"use client";

import { Menu, Bell, Search, User, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null; image?: string | null; role?: string | null } | null;
}

export function Header({ onMenuClick, title = "Dashboard", user }: HeaderProps) {
  const router = useRouter();

  // Super Admin → /admin/profile, baaki sab → /dashboard/profile
  const profileUrl =
    user?.role?.toUpperCase() === "SUPER_ADMIN"
      ? "/admin/profile"
      : "/dashboard/profile";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="ml-2 hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          Ctrl+K
        </kbd>
      </div>

      <button className="relative text-muted-foreground hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">3</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg hover:bg-muted px-2 py-1 transition-colors">
            <Avatar src={user?.image} name={user?.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground leading-tight">{user?.email || ""}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <Avatar src={user?.image} name={user?.name} size="sm" />
              <div>
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(profileUrl)}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="text-red-500 focus:text-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
