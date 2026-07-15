"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Search, Globe, Hash, Link, Monitor, LayoutDashboard, Settings, Users, UserCog, FileText, Folder, Bell, Menu, Home, Star, Heart, Upload, Download, Save, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, CreditCard, ShoppingCart, Package, MessageSquare, Calendar, Clock, Lock, Share2, TrendingUp, DollarSign, BarChart3, Percent, Repeat, Puzzle, Activity, PlusCircle, Shield, Tag, Briefcase, Megaphone, FileSpreadsheet, UserCheck, Image, Video, Camera, LogOut, GripVertical, File, Info, AlertTriangle, CheckCircle, HelpCircle, BookOpen, ExternalLink, AtSign, Edit, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  id: string;
  menuType: string;
  name: string;
  identifier: string;
  parent: string;
  link: string;
  linkType: string;
  position: number;
  icon: string;
  global: boolean;
  status: "active" | "inactive";
};

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Settings, Users, UserCog, FileText, Folder,
  Search, Bell, Menu, Home, Star, Heart, Plus, X,
  Upload, Download, Save, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, CreditCard, ShoppingCart, Package,
  MessageSquare, Calendar, Clock, Globe, Lock,
  ExternalLink, AtSign, Monitor, Share2,
  TrendingUp, DollarSign, BarChart3, Percent, Repeat, Puzzle,
  Activity, PlusCircle, Shield, Tag, Briefcase, Megaphone,
  FileSpreadsheet, UserCheck, Image, Video, Camera, LogOut,
  GripVertical, File, Info, AlertTriangle, CheckCircle, HelpCircle, BookOpen
};

const commonIcons = [
  "LayoutDashboard", "Settings", "Users", "UserCog", "FileText", "Folder",
  "Search", "Bell", "Menu", "Home", "Star", "Heart", "Plus", "X",
  "Upload", "Download", "Save", "Trash2", "Eye", "EyeOff",
  "ArrowUp", "ArrowDown", "CreditCard", "ShoppingCart", "Package",
  "MessageSquare", "Calendar", "Clock", "Globe", "Lock"
];

const socialIcons = ["Globe", "ExternalLink", "AtSign", "Share2", "Monitor"];

const allIconNames = [...new Set([...commonIcons, ...socialIcons,
  "TrendingUp", "DollarSign", "BarChart3", "Percent", "Repeat", "Puzzle",
  "Activity", "PlusCircle", "Shield", "Tag", "Briefcase", "Megaphone",
  "FileSpreadsheet", "UserCheck", "Image", "Video", "Camera", "LogOut",
  "GripVertical", "File", "Info", "AlertTriangle", "CheckCircle", "HelpCircle", "BookOpen"
])];

const linkTypeIcons: Record<string, any> = {
  "Hash Link": Hash, "External Link": Globe, "Internal Link": Link, "Embedded Iframe": Monitor,
};

export default function SideMenuBuilderPage() {
  const [userData, setUserData] = useState<{ name?: string; email?: string; image?: string; role?: string } | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [iconTab, setIconTab] = useState<"Common" | "Social" | "All Icons">("All Icons");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<MenuItem>({
    id: "", menuType: "Main Menu", name: "", identifier: "", parent: "",
    link: "", linkType: "Internal Link", position: 999, icon: "LayoutDashboard",
    global: false, status: "active",
  });

  const apiToMenuItem = (item: any): MenuItem => ({
    id: item.id,
    menuType: item.menuType === "sidebar" ? "Main Menu" : item.menuType === "submenu" ? "Sub Menu" : item.menuType || "Main Menu",
    name: item.name,
    identifier: item.identifier,
    parent: item.parent || "",
    link: item.link || "#",
    linkType: item.linkType === "internal" ? "Internal Link" : item.linkType === "external" ? "External Link" : item.linkType === "hash" ? "Hash Link" : item.linkType === "iframe" ? "Embedded Iframe" : "Internal Link",
    position: item.position ?? 0,
    icon: item.icon || "Menu",
    global: item.global ?? false,
    status: item.status === true || item.status === "active" ? "active" : "inactive",
  });

  const menuItemToApi = (item: MenuItem) => ({
    menuType: item.menuType === "Main Menu" ? "sidebar" : "submenu",
    name: item.name,
    identifier: item.identifier,
    parent: item.parent,
    link: item.link,
    linkType: item.linkType === "Internal Link" ? "internal" : item.linkType === "External Link" ? "external" : item.linkType === "Hash Link" ? "hash" : "iframe",
    position: item.position,
    icon: item.icon,
    global: item.global,
    status: item.status === "active",
  });

  const fetchMenus = async () => {
    try {
      const [sessionData, menuData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/side-menu-builder").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setMenus((menuData.menus || []).map(apiToMenuItem));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const resetForm = () => {
    setForm({ id: "", menuType: "Main Menu", name: "", identifier: "", parent: "", link: "", linkType: "Internal Link", position: 999, icon: "LayoutDashboard", global: false, status: "active" });
    setShowForm(false); setShowIconPicker(false); setIconSearch(""); setIconTab("All Icons");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.identifier) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/side-menu-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuItemToApi(form)),
      });
      const data = await res.json();
      if (data.menu) {
        setMenus((prev) => [...prev, apiToMenuItem(data.menu)]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const item = menus.find((m) => m.id === id);
    if (!item) return;
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/side-menu-builder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus === "active" }),
      });
      if (res.ok) {
        setMenus((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVisibility = async (id: string) => {
    const item = menus.find((m) => m.id === id);
    if (!item) return;
    try {
      const res = await fetch("/api/admin/side-menu-builder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, global: !item.global }),
      });
      if (res.ok) {
        setMenus((prev) => prev.map((m) => m.id === id ? { ...m, global: !m.global } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMenu = async (id: string) => {
    try {
      const res = await fetch("/api/admin/side-menu-builder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, _deleted: true }),
      });
      if (res.ok || res.status === 404) {
        setMenus((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const iconList = iconTab === "Common" ? commonIcons : iconTab === "Social" ? socialIcons : allIconNames;
  const filteredIcons = iconList.filter((i) => i.toLowerCase().includes(iconSearch.toLowerCase()));

  const filteredMenus = menus.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.identifier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="Side Menu Builder" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Side Menu Builder" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Manage Custom Menus</h2>
            <p className="text-muted-foreground text-sm">Create and manage custom sidebar menu items</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Create Menu</CardTitle>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Menu Type</label>
                <div className="flex gap-4">
                  {(["Main Menu", "Sub Menu"] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="menuType" checked={form.menuType === type} onChange={() => setForm({ ...form, menuType: type })} className="accent-primary" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter menu name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Menu Identifier *</label>
                  <Input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="Enter unique identifier" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Parent</label>
                  <select value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">None (Top Level)</option>
                    {menus.filter((m) => m.menuType === "Main Menu").map((m) => (
                      <option key={m.id} value={m.identifier}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Position *</label>
                  <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Link Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Hash Link", "External Link", "Internal Link", "Embedded Iframe"] as const).map((type) => {
                    const Icon = linkTypeIcons[type];
                    return (
                      <button key={type} onClick={() => setForm({ ...form, linkType: type })}
                        className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${form.linkType === type ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}>
                        <Icon className="h-4 w-4" />{type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Link *</label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder={form.linkType === "External Link" ? "https://example.com" : form.linkType === "Embedded Iframe" ? "https://embed-url.com" : form.linkType === "Hash Link" ? "#section-id" : "/internal-url"} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Choose an icon for the primary menu *</label>
                <div className="relative">
                  <button onClick={() => setShowIconPicker(!showIconPicker)}
                    className="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted transition-colors">
                    {(() => { const Ic = iconMap[form.icon]; return Ic ? <Ic className="h-4 w-4" /> : null; })()}
                    <span className="text-muted-foreground">{form.icon}</span>
                  </button>
                  {showIconPicker && (
                    <Card className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto">
                      <CardContent className="p-2 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-8 h-9" placeholder="Search or select any icons" value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-1 rounded-lg bg-muted p-1">
                          {(["Common", "Social", "All Icons"] as const).map((tab) => (
                            <button key={tab} onClick={() => setIconTab(tab)}
                              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${iconTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{tab}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {filteredIcons.map((name) => {
                            const IconComp = iconMap[name];
                            return (
                              <button key={name} onClick={() => { setForm({ ...form, icon: name }); setShowIconPicker(false); }}
                                className={`flex flex-col items-center gap-0.5 rounded p-1.5 text-[10px] hover:bg-muted transition-colors ${form.icon === name ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                                {IconComp && <IconComp className="h-4 w-4" />}
                                <span className="truncate w-full text-center">{name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.global} onChange={(e) => setForm({ ...form, global: e.target.checked })} className="accent-primary" />
                  <span className="text-sm font-medium">Make it global</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status === "active"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "active" : "inactive" })} className="accent-primary" />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Create Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {menus.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-sm font-medium">Custom Menus ({menus.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 h-9 w-48" placeholder="Search menus..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="flex h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Menu Identifier</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Parent</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Link</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Link Type</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Visibility</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Order</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredMenus.length > 0 ? filteredMenus : menus).map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {(() => { const Ic = iconMap[item.icon as keyof typeof iconMap] || iconMap.Menu; return Ic ? <Ic className="h-4 w-4 text-muted-foreground" /> : null; })()}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{item.identifier}</td>
                        <td className="py-3 px-2 text-muted-foreground">{item.parent || "-"}</td>
                        <td className="py-3 px-2 text-muted-foreground max-w-[150px] truncate">{item.link}</td>
                        <td className="py-3 px-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.linkType}</span>
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => toggleVisibility(item.id)} className="text-muted-foreground hover:text-foreground">
                            {item.global ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground/50" />}
                          </button>
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => toggleStatus(item.id)}
                            className={cn("rounded-full px-2 py-0.5 text-xs font-medium", item.status === "active" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                            {item.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{item.position}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <button className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"><Edit className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deleteMenu(item.id)} className="rounded p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
