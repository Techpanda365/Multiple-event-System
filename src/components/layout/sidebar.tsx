"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, Calculator, FolderKanban,
  ShoppingCart, CreditCard, Puzzle, Settings,
  Building2, BarChart3, Globe, UserCog, X, Shield,
  FileText, Download, Package, Warehouse, Repeat,
  Box, Handshake, FileSpreadsheet, DollarSign,
  PiggyBank, BookOpen, Scale, TrendingUp, Award,
  Clock, Calendar, Heart, AlertTriangle, MessageSquare,
  FileUp, Megaphone, PartyPopper, CheckSquare,
  Target,  Printer, Tag, Percent, PlusCircle,
  ChevronDown, Search,
  Activity, Eye, Layout, UserPlus, Layers, PhoneCall, HelpCircle
} from "lucide-react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { buildCompanyNav, type NavItem, type NavSection } from "@/lib/navigation/company-nav";
import { WorkspaceSwitcher } from "@/components/admin/workspace-switcher";

const companyNav = buildCompanyNav();

const superAdminNav: NavSection[] = [
  { parent: { title: "Dashboard", href: "/admin", icon: LayoutDashboard }, children: [] },
  { parent: { title: "Users", href: "/admin/users", icon: UserCog }, children: [] },
  { parent: { title: "Add-ons Manager", href: "/admin/addons", icon: Puzzle }, children: [] },
  { parent: { title: "Google Analytics", href: "/admin/google-analytics", icon: BarChart3 }, children: [
    { title: "Realtime Overview", href: "/admin/google-analytics/realtime", icon: Activity },
    { title: "Generate", href: "/admin/generate", icon: BarChart3, children: [
      { title: "Overview", href: "/admin/generate/overview", icon: Eye },
      { title: "Audiences", href: "/admin/generate/audiences", icon: Users },
      { title: "Landing Page", href: "/admin/generate/landing-page", icon: Layout },
      { title: "User Acquisition", href: "/admin/generate/user-acquisition", icon: UserPlus },
      { title: "User Acquisition Cohorts", href: "/admin/generate/user-acquisition-cohorts", icon: Layers },
    ]},
    { title: "Drive Sales", href: "/admin/drive-sales", icon: TrendingUp, children: [
      { title: "Overview", href: "/admin/drive-sales/overview", icon: Eye },
      { title: "Ecommerce Purchase", href: "/admin/drive-sales/ecommerce-purchase", icon: ShoppingCart },
      { title: "Promotions", href: "/admin/drive-sales/promotions", icon: Percent },
      { title: "Purchase & Check", href: "/admin/drive-sales/purchase-check", icon: CheckSquare },
      { title: "Transactions", href: "/admin/drive-sales/transactions", icon: DollarSign },
    ]},
    { title: "Traffic Analysis", href: "/admin/traffic-analysis", icon: Activity, children: [
      { title: "Overview", href: "/admin/traffic-analysis/overview", icon: Eye },
      { title: "Demographic Details", href: "/admin/traffic-analysis/demographic-details", icon: Users },
      { title: "Pages and Screens", href: "/admin/traffic-analysis/pages-and-screens", icon: Layout },
    ]},
    { title: "User Engagement", href: "/admin/user-engagement", icon: Users, children: [
      { title: "Overview", href: "/admin/user-engagement/overview", icon: Eye },
      { title: "Events", href: "/admin/user-engagement/events", icon: Activity },
      { title: "Pages and Screens", href: "/admin/user-engagement/pages-and-screens", icon: Layout },
    ]},
  ]},
  { parent: { title: "File Share Verification", href: "/admin/file-share-verification", icon: Shield }, children: [] },
  { parent: { title: "Backup & Restore", href: "/admin/backup", icon: Download }, children: [
    { title: "System Backups", href: "/admin/backup/system", icon: FileText },
    { title: "Create Backup", href: "/admin/backup/create", icon: PlusCircle },
  ]},
  {
    parent: { title: "HelpDesk", href: "/admin/helpdesk", icon: MessageSquare },
    children: [
      { title: "Today's Tickets", href: "/admin/helpdesk/todays-tickets", icon: Clock },
      { title: "All Tickets", href: "/admin/helpdesk/all-tickets", icon: FileText },
      { title: "Categories", href: "/admin/helpdesk/categories", icon: Tag },
    ],
  },
  {
    parent: { title: "Subscription", href: "/admin/subscription", icon: CreditCard },
    children: [
      { title: "Subscription Settings", href: "/admin/subscription/settings", icon: Settings },
      { title: "Coupons", href: "/admin/subscription/coupons", icon: Percent },
      { title: "Bank Transfer Requests", href: "/admin/subscription/bank-transfer-requests", icon: DollarSign },
      { title: "Orders", href: "/admin/subscription/orders", icon: ShoppingCart },
    ],
  },
  {
    parent: { title: "CMS", href: "/admin/cms", icon: Globe },
    children: [
      { title: "Landing Page", href: "/admin/cms/landing-page", icon: FileText },
      { title: "About", href: "/admin/cms/about", icon: FileText },
      { title: "Contact", href: "/admin/cms/contact", icon: PhoneCall },
      { title: "FAQ", href: "/admin/cms/faq", icon: HelpCircle },
      { title: "Privacy Policy", href: "/admin/cms/privacy-policy", icon: FileText },
      { title: "Terms & Conditions", href: "/admin/cms/terms-conditions", icon: FileText },
      { title: "Blogs", href: "/admin/cms/blogs", icon: FileText },
      { title: "Marketplace", href: "/admin/cms/marketplace", icon: ShoppingCart },
      { title: "Custom Pages", href: "/admin/cms/custom-pages", icon: FileSpreadsheet },
      { title: "Newsletter Subscribers", href: "/admin/cms/newsletter-subscribers", icon: Users },
    ],
  },
  {
    parent: { title: "Email Templates", href: "/admin/email-templates", icon: MessageSquare },
    children: [],
  },
  {
    parent: { title: "Notification Templates", href: "/admin/notification-templates", icon: Megaphone },
    children: [],
  },
  {
    parent: { title: "Side Menu Builder", href: "/admin/side-menu-builder", icon: LayoutDashboard },
    children: [],
  },
  {
    parent: { title: "Media Library", href: "/admin/media-library", icon: Package },
    children: [],
  },
  {
    parent: { title: "Settings", href: "/admin/settings", icon: Settings },
    children: [],
  },
  {
    parent: { title: "WorkDo Platform", href: "/admin/workdo-platform", icon: Globe },
    children: [],
  },
  {
    parent: { title: "Login History", href: "/admin/login-history", icon: Clock },
    children: [],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null } | null;
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = user?.role?.toUpperCase() === "SUPER_ADMIN";
  const sections = isSuperAdmin ? superAdminNav : companyNav;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [menuSearch, setMenuSearch] = useState("");
  const prevPathname = useRef(pathname);

  const filteredSections = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(({ parent, children }) => {
      if (parent.title.toLowerCase().includes(q)) return true;
      return children.some((child) => {
        if (child.title.toLowerCase().includes(q)) return true;
        return child.children?.some((nested) => nested.title.toLowerCase().includes(q));
      });
    });
  }, [sections, menuSearch]);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const currentPath = pathname;
    const newExpanded = new Set<string>();

    sections.forEach(({ parent, children }) => {
      if (currentPath === parent.href || currentPath.startsWith(parent.href + "/")) {
        newExpanded.add(parent.title);
      }
      children.forEach(child => {
        if (currentPath === child.href || currentPath.startsWith(child.href + "/")) {
          newExpanded.add(parent.title);
        }
        if (child.children) {
          child.children.forEach(nested => {
            if (currentPath === nested.href || currentPath.startsWith(nested.href + "/")) {
              newExpanded.add(parent.title);
              newExpanded.add(child.title);
            }
          });
        }
      });
    });

    setExpanded(newExpanded);
  }, [pathname, sections]);

  const toggle = useCallback((title: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const renderItem = (item: NavItem, depth: number = 0) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const hasSub = item.children && item.children.length > 0;
    const isExpandedSub = hasSub && expanded.has(item.title);
    const padding = depth === 0 ? "pl-3" : depth === 1 ? "pl-8" : "pl-11";

    if (hasSub) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggle(item.title)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-1 text-xs transition-colors",
              padding,
              active && !isExpandedSub
                ? "bg-primary/10 text-white font-medium"
                : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
            )}
          >
            {depth > 0 && <div className="h-1 w-1 rounded-full bg-sidebar-foreground/30 flex-shrink-0" />}
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", isExpandedSub ? "rotate-0" : "-rotate-90")} />
          </button>
          {isExpandedSub && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
              {item.children!.map(c => renderItem(c, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1 text-xs transition-colors",
          padding,
          active
            ? "bg-primary/10 text-white font-medium"
            : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
        )}
      >
        {depth > 0 && <div className="h-1 w-1 rounded-full bg-sidebar-foreground/30 flex-shrink-0" />}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">D</div>
            <div>
              <p className="text-sm font-semibold text-white">Dash SaaS</p>
              <p className="text-[10px] text-sidebar-foreground/60">ERP System</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuperAdmin ? (
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white">Super Admin</p>
              <p className="text-[10px] text-sidebar-foreground/60">Full System Access</p>
            </div>
          </div>
        ) : (
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Company</p>
          </div>
        )}

        {isSuperAdmin && <WorkspaceSwitcher />}

        <div className="px-3 py-2 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/40" />
            <input
              type="text"
              placeholder="Search menu..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filteredSections.length === 0 ? (
            <p className="px-3 py-4 text-xs text-sidebar-foreground/50 text-center">No modules found</p>
          ) : (
            // filteredSections.map(({ parent }) => {
            //   const isActive = pathname === parent.href || pathname.startsWith(parent.href + "/");
            //   const Icon = parent.icon;
            //   return (
            //     <Link
            //       key={parent.title}
            //       href={parent.href}
            //       onClick={onClose}
            //       className={cn(
            //         "flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
            //         isActive
            //           ? "bg-primary/20 text-white font-medium"
            //           : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
            //       )}
            //     >
            //       <Icon className="h-4 w-4 flex-shrink-0" />
            //       <span className="flex-1 text-left truncate">{parent.title}</span>
            //       {parent.badge && (
            //         <span className={cn(
            //           "rounded px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0",
            //           parent.badge === "New"
            //             ? "bg-green-500/20 text-green-400"
            //             : "bg-amber-500/20 text-amber-400"
            //         )}>
            //           {parent.badge}
            //         </span>
            //       )}
            //     </Link>
            //   );
            // })

            filteredSections.map(({ parent, children }) => {
  const isActive =
    pathname === parent.href ||
    pathname.startsWith(parent.href + "/");

  const Icon = parent.icon;
  const hasChildren = children.length > 0;
  const isExpandedMenu = expanded.has(parent.title);
if (hasChildren) {
  return (
    <div key={parent.title}>
      <button
        onClick={() => toggle(parent.title)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/20 text-white font-medium"
            : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />

        <span className="flex-1 text-left truncate">
          {parent.title}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isExpandedMenu ? "rotate-180" : ""
          )}
        />
      </button>

      {isExpandedMenu && (
        <div className="ml-6 mt-1 space-y-1">
          {children.map((child) => renderItem(child, 1))}
        </div>
      )}
    </div>
  );
}

  return (
    <Link
      key={parent.title}
      href={parent.href}
      onClick={onClose}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-primary/20 text-white font-medium"
          : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-left truncate">
        {parent.title}
      </span>

      {parent.badge && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0",
            parent.badge === "New"
              ? "bg-green-500/20 text-green-400"
              : "bg-amber-500/20 text-amber-400"
          )}
        >
          {parent.badge}
        </span>
      )}
    </Link>
  );
})
          )}
        </nav>

      </aside>
    </>
  );
}
