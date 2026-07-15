"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2, Eye, Palette, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navTabs = ["Setup", "Layout", "Content", "Social", "Engagement", "Theme Color", "Page"];
const sectionOrderItems = ["Header", "Hero", "Stats", "Features", "Modules", "Benefits", "Gallery", "CTA", "Footer"];
const colorPresets = [
  { name: "Green", primary: "#10b981", secondary: "#34d399", accent: "#059669" },
  { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa", accent: "#1d4ed8" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#a78bfa", accent: "#6d28d9" },
  { name: "Orange", primary: "#f97316", secondary: "#fb923c", accent: "#ea580c" },
  { name: "Red", primary: "#ef4444", secondary: "#f87171", accent: "#dc2626" },
];

const emptyData = {
  companyName: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  headerEnabled: true,
  headerVariant: "Standard",
  headerCompanyName: "",
  headerCtaText: "",
  headerAddonLink: true,
  headerPricingLink: true,
  sectionEnabled: Object.fromEntries(sectionOrderItems.map((s) => [s, true])),
  navItems: [] as { text: string; type: string; url: string }[],
  heroEnabled: true,
  hero: { variant: "Image Left Split", title: "", subtitle: "", primaryText: "", primaryLink: "", secondaryText: "", secondaryLink: "", image: "" },
  footerEnabled: true,
  footer: { variant: "Standard", description: "", newsletterTitle: "", newsletterDesc: "", newsletterBtn: "", copyright: "" },
  footerNavSections: [] as { title: string; links: { label: string; url: string }[] }[],
  statsEnabled: true,
  statsVariant: "Coloured Background",
  stats: [] as { label: string; value: number }[],
  featuresEnabled: true,
  featuresVariant: "Grid",
  featuresTitle: "",
  featuresSubtitle: "",
  features: [] as { title: string; description: string; icon: string }[],
  modulesEnabled: true,
  modulesVariant: "Tabs",
  modulesSectionTitle: "",
  modulesSectionSubtitle: "",
  modules: [] as { title: string; description: string; icon: string }[],
  benefitsEnabled: true,
  benefitsVariant: "Accordion",
  benefitsSectionTitle: "",
  benefits: [] as { title: string; description: string }[],
  galleryEnabled: true,
  galleryVariant: "Slider",
  gallerySectionTitle: "",
  gallerySectionSubtitle: "",
  galleryImages: [] as (string | null)[],
  ctaEnabled: true,
  ctaVariant: "Centered",
  ctaTitle: "",
  ctaSubtitle: "",
  ctaPrimaryText: "",
  ctaPrimaryLink: "",
  ctaSecondaryText: "",
  ctaSecondaryLink: "",
  colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4" },
  addonPageTitle: "",
  addonPageSubtitle: "",
  addonEmptyState: "",
  addonCardVariant: "Overlapping",
  addonItemsPerPage: 12,
  addonDefaultPriceType: "Monthly",
  addonShowSearch: true,
  addonShowPriceFilter: true,
  addonShowSort: true,
  pricingPageTitle: "",
  pricingPageSubtitle: "",
  pricingCardVariant: "Standard",
  pricingDefaultBilling: "Monthly",
  pricingPlansPerRow: 3,
  pricingCurrency: "USD ($)",
  pricingShowDiscount: true,
  pricingShowFreeTrial: true,
};

export default function LandingPageSettings() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Setup");
  const [setupTab, setSetupTab] = useState<"General" | "Order">("General");
  const [layoutTab, setLayoutTab] = useState<"Header" | "Hero" | "Footer">("Header");
  const [pageTab, setPageTab] = useState<"Addon" | "Pricing">("Addon");
  const [socialTab, setSocialTab] = useState<"Stats" | "Gallery">("Stats");
  const [contentTab, setContentTab] = useState<"Features" | "Modules" | "Benefits">("Features");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/cms/landing-page").then((r) => r.json()),
    ])
      .then(([session, lpRes]) => {
        if (session.user) setUserData(session.user);
        const apiData = lpRes.data?.landingPage;
        if (apiData) {
          setData({ ...emptyData, ...apiData });
        } else {
          setData({ ...emptyData });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout title="Landing Page" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Landing Page" user={userData}>
      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div>
            <h2 className="text-2xl font-bold">Landing Page Settings</h2>
            <p className="text-muted-foreground text-sm">Customize your landing page appearance and content</p>
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1 overflow-x-auto">
            {navTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("whitespace-nowrap rounded px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{tab}</button>
            ))}
          </div>

          {activeTab === "Setup" && (
            <div className="space-y-4">
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(["General", "Order"] as const).map((t) => (
                  <button key={t} onClick={() => setSetupTab(t)}
                    className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
                      setupTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>{t}</button>
                ))}
              </div>

              {setupTab === "General" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Company Information</CardTitle>
                    <p className="text-xs text-muted-foreground">Basic company details for your landing page</p>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-xl">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                      <Input value={data.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Your company name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Contact Email</label>
                      <Input type="email" value={data.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="support@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Contact Phone</label>
                      <Input value={data.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+[country code][phone number]" />
                      <p className="text-xs text-muted-foreground mt-1">Format: +[country code][phone number]</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Contact Address</label>
                      <textarea value={data.contactAddress} onChange={(e) => update("contactAddress", e.target.value)} className="flex w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Enter your company address" />
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}

              {setupTab === "Order" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Section Order</CardTitle>
                    <p className="text-xs text-muted-foreground">Drag and drop to reorder sections on your landing page</p>
                  </CardHeader>
                  <CardContent className="space-y-2 max-w-xl">
                    {sectionOrderItems.map((section, i) => (
                      <div key={section} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                        <span className="text-sm flex-1">{i + 1}. {section}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={data.sectionEnabled[section]} onChange={() => setData((prev: any) => ({ ...prev, sectionEnabled: { ...prev.sectionEnabled, [section]: !prev.sectionEnabled[section] } }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2 text-xs text-muted-foreground">{data.sectionEnabled[section] ? "Enabled" : "Disabled"}</span>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "Layout" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">Layout Settings</CardTitle>
                    <p className="text-xs text-muted-foreground">Customize your landing page layout sections</p>
                  </div>
                </div>
                <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
                  {(["Header", "Hero", "Footer"] as const).map((t) => (
                    <button key={t} onClick={() => setLayoutTab(t)}
                      className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
                        layoutTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}>{t}</button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {layoutTab === "Header" && (
                  <div className="space-y-6 max-w-xl">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Header Navigation</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={data.headerEnabled} onChange={() => update("headerEnabled", !data.headerEnabled)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2 text-sm font-medium">Enable Section</span>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">Logo and navigation menu</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Header Variant</label>
                      <select value={data.headerVariant} onChange={(e) => update("headerVariant", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Standard</option>
                        <option>Minimal</option>
                        <option>Transparent</option>
                        <option>Gradient</option>
                        <option>Centered</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Company Name</label>
                      <Input value={data.headerCompanyName} onChange={(e) => update("headerCompanyName", e.target.value)} placeholder="Company name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">CTA Button Text</label>
                      <Input value={data.headerCtaText} onChange={(e) => update("headerCtaText", e.target.value)} placeholder="Get Started" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Display Options</label>
                      <div className="space-y-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={data.headerAddonLink} onChange={() => update("headerAddonLink", !data.headerAddonLink)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2 text-sm">Enable Addon Link</span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={data.headerPricingLink} onChange={() => update("headerPricingLink", !data.headerPricingLink)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2 text-sm">Enable Pricing Link</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Navigation Menu</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, navItems: [...prev.navItems, { text: "", type: "Link", url: "" }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Navigation Item
                        </Button>
                      </div>
                      {data.navItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No navigation items yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.navItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Menu Text*</label>
                                  <Input size={1} className="h-8 text-sm" value={item.text} onChange={(e) => { const next = [...data.navItems]; next[i] = { ...next[i], text: e.target.value }; update("navItems", next); }} placeholder="Home" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Type*</label>
                                  <select className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm" value={item.type} onChange={(e) => { const next = [...data.navItems]; next[i] = { ...next[i], type: e.target.value }; update("navItems", next); }}>
                                    <option>Link</option>
                                    <option>Dropdown</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">URL/Page</label>
                                  <Input size={1} className="h-8 text-sm" value={item.url} onChange={(e) => { const next = [...data.navItems]; next[i] = { ...next[i], url: e.target.value }; update("navItems", next); }} placeholder="https://" />
                                </div>
                                <div className="flex items-end pb-1.5">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={item.newTab || false} onChange={(e) => { const next = [...data.navItems]; next[i] = { ...next[i], newTab: e.target.checked }; update("navItems", next); }} className="accent-primary" />
                                    <span className="text-xs text-muted-foreground">Open in New Tab</span>
                                  </label>
                                </div>
                              </div>
                              <button onClick={() => update("navItems", data.navItems.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </div>
                )}

                {layoutTab === "Hero" && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Hero Content</label>
                        <p className="text-xs text-muted-foreground">Main headline and supporting text</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.heroEnabled} onChange={() => update("heroEnabled", !data.heroEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hero Variant</label>
                      <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={data.hero.variant} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, variant: e.target.value } }))}>
                        <option>Image Left Split</option>
                        <option>Image Right Split</option>
                        <option>Centered Content</option>
                        <option>Full Screen</option>
                        <option>Minimal</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hero Title</label>
                      <Input value={data.hero.title} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} placeholder="Hero title" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hero Subtitle</label>
                      <textarea className="flex w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={data.hero.subtitle} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))} placeholder="Hero subtitle" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Primary Button Text</label>
                        <Input value={data.hero.primaryText} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, primaryText: e.target.value } }))} placeholder="Start Free Trial" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Primary Button Link</label>
                        <Input value={data.hero.primaryLink} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, primaryLink: e.target.value } }))} placeholder="https://" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Secondary Button Text</label>
                        <Input value={data.hero.secondaryText} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, secondaryText: e.target.value } }))} placeholder="Login" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Secondary Button Link</label>
                        <Input value={data.hero.secondaryLink} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, secondaryLink: e.target.value } }))} placeholder="https://" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hero Image</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input placeholder="Upload or enter image URL" value={data.hero.image} onChange={(e) => setData((prev: any) => ({ ...prev, hero: { ...prev.hero, image: e.target.value } }))} />
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0">Upload</Button>
                      </div>
                      {data.hero.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-border">
                          <div className="aspect-video bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            <span className="truncate px-2">{data.hero.image}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </div>
                )}

                {layoutTab === "Footer" && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Footer Content</label>
                        <p className="text-xs text-muted-foreground">Footer information and links</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.footerEnabled} onChange={() => update("footerEnabled", !data.footerEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Footer Variant</label>
                      <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={data.footer.variant} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, variant: e.target.value } }))}>
                        <option>Standard</option>
                        <option>Minimal</option>
                        <option>Dark</option>
                        <option>Centered</option>
                        <option>Split</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Company Description</label>
                      <textarea className="flex w-full min-h-[70px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={data.footer.description} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, description: e.target.value } }))} placeholder="Company description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Newsletter Title</label>
                        <Input value={data.footer.newsletterTitle} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, newsletterTitle: e.target.value } }))} placeholder="Join Our Community" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Newsletter Button Text</label>
                        <Input value={data.footer.newsletterBtn} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, newsletterBtn: e.target.value } }))} placeholder="Subscribe" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Newsletter Description</label>
                      <textarea className="flex w-full min-h-[60px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={data.footer.newsletterDesc} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, newsletterDesc: e.target.value } }))} placeholder="Newsletter description" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Copyright Text</label>
                      <Input value={data.footer.copyright} onChange={(e) => setData((prev: any) => ({ ...prev, footer: { ...prev.footer, copyright: e.target.value } }))} placeholder="© 2026 Company Name. All rights reserved." />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">Navigation Sections</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, footerNavSections: [...prev.footerNavSections, { title: "", links: [{ label: "", url: "" }] }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Navigation Section
                        </Button>
                      </div>
                      {data.footerNavSections.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No navigation sections yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {data.footerNavSections.map((section: any, si: number) => (
                            <div key={si} className="rounded-lg border border-border p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Section {si + 1}</span>
                                <button onClick={() => update("footerNavSections", data.footerNavSections.filter((_: any, j: number) => j !== si))} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Section Title</label>
                                <Input size={1} className="h-8 text-sm" value={section.title} onChange={(e) => { const next = [...data.footerNavSections]; next[si] = { ...next[si], title: e.target.value }; update("footerNavSections", next); }} placeholder="e.g. Product" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] text-muted-foreground">Section Links</label>
                                  <button className="text-[10px] text-primary hover:underline" onClick={() => { const next = [...data.footerNavSections]; next[si] = { ...next[si], links: [...next[si].links, { label: "", url: "" }] }; update("footerNavSections", next); }}>+ Add Link</button>
                                </div>
                                <div className="space-y-2">
                                  {section.links.map((link: any, li: number) => (
                                    <div key={li} className="flex items-center gap-2">
                                      <Input size={1} className="h-8 text-sm flex-1" value={link.label} onChange={(e) => { const next = [...data.footerNavSections]; next[si].links[li] = { ...next[si].links[li], label: e.target.value }; update("footerNavSections", next); }} placeholder="Link label" />
                                      <Input size={1} className="h-8 text-sm flex-1" value={link.url} onChange={(e) => { const next = [...data.footerNavSections]; next[si].links[li] = { ...next[si].links[li], url: e.target.value }; update("footerNavSections", next); }} placeholder="URL" />
                                      <button onClick={() => { const next = [...data.footerNavSections]; next[si].links = next[si].links.filter((_: any, k: number) => k !== li); update("footerNavSections", next); }} className="text-red-500 hover:text-red-600 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "Content" && (
            <div className="space-y-4">
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(["Features", "Modules", "Benefits"] as const).map((t) => (
                  <button key={t} onClick={() => setContentTab(t)}
                    className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
                      contentTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>{t}</button>
                ))}
              </div>

              {contentTab === "Features" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Features Content</CardTitle>
                        <p className="text-xs text-muted-foreground">Manage your product features</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.featuresEnabled} onChange={() => update("featuresEnabled", !data.featuresEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-xl">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Features Variant</label>
                      <select value={data.featuresVariant} onChange={(e) => update("featuresVariant", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Grid</option>
                        <option>List</option>
                        <option>Cards</option>
                        <option>Split</option>
                        <option>Carousel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Title</label>
                      <Input value={data.featuresTitle} onChange={(e) => update("featuresTitle", e.target.value)} placeholder="Powerful Features" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Subtitle</label>
                      <Input value={data.featuresSubtitle} onChange={(e) => update("featuresSubtitle", e.target.value)} placeholder="Everything your business needs in one integrated platform" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Features List</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, features: [...prev.features, { title: "", description: "", icon: "Folder" }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Feature
                        </Button>
                      </div>
                      {data.features.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No features yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {data.features.map((f: any, i: number) => (
                            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Item {i + 1}</span>
                                <button onClick={() => update("features", data.features.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Feature Title*</label>
                                <Input size={1} className="h-8 text-sm" value={f.title} onChange={(e) => { const next = [...data.features]; next[i] = { ...next[i], title: e.target.value }; update("features", next); }} placeholder="Project Management" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Feature Description*</label>
                                <textarea className="flex w-full min-h-[60px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={f.description} onChange={(e) => { const next = [...data.features]; next[i] = { ...next[i], description: e.target.value }; update("features", next); }} placeholder="Describe this feature..." />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Icon</label>
                                <select value={f.icon} onChange={(e) => { const next = [...data.features]; next[i] = { ...next[i], icon: e.target.value }; update("features", next); }} className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm">
                                  <option>Folder</option>
                                  <option>User Check</option>
                                  <option>Credit Card</option>
                                  <option>Users</option>
                                  <option>Calculator</option>
                                  <option>Building</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}

              {contentTab === "Modules" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Business Modules</CardTitle>
                        <p className="text-xs text-muted-foreground">Tabbed modules showcase section</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.modulesEnabled} onChange={() => update("modulesEnabled", !data.modulesEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-xl">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Modules Variant</label>
                      <select value={data.modulesVariant} onChange={(e) => update("modulesVariant", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Tabs</option>
                        <option>Grid</option>
                        <option>Cards</option>
                        <option>Carousel</option>
                        <option>Accordion</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Title</label>
                      <Input value={data.modulesSectionTitle} onChange={(e) => update("modulesSectionTitle", e.target.value)} placeholder="Complete Business Solutions" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Subtitle</label>
                      <Input value={data.modulesSectionSubtitle} onChange={(e) => update("modulesSectionSubtitle", e.target.value)} placeholder="Discover our comprehensive modules" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Modules List</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, modules: [...prev.modules, { title: "", description: "", icon: "Folder" }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Module
                        </Button>
                      </div>
                      {data.modules.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No modules yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {data.modules.map((m: any, i: number) => (
                            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Module {i + 1}</span>
                                <button onClick={() => update("modules", data.modules.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Module Title*</label>
                                <Input size={1} className="h-8 text-sm" value={m.title} onChange={(e) => { const next = [...data.modules]; next[i] = { ...next[i], title: e.target.value }; update("modules", next); }} placeholder="Project Management" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Module Description*</label>
                                <textarea className="flex w-full min-h-[60px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={m.description} onChange={(e) => { const next = [...data.modules]; next[i] = { ...next[i], description: e.target.value }; update("modules", next); }} placeholder="Describe this module..." />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Icon</label>
                                <select value={m.icon} onChange={(e) => { const next = [...data.modules]; next[i] = { ...next[i], icon: e.target.value }; update("modules", next); }} className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm">
                                  <option>Folder</option>
                                  <option>User Check</option>
                                  <option>Credit Card</option>
                                  <option>Users</option>
                                  <option>Calculator</option>
                                  <option>Building</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}

              {contentTab === "Benefits" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Benefits Section</CardTitle>
                        <p className="text-xs text-muted-foreground">Expandable benefits accordion</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.benefitsEnabled} onChange={() => update("benefitsEnabled", !data.benefitsEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-xl">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Benefits Variant</label>
                      <select value={data.benefitsVariant} onChange={(e) => update("benefitsVariant", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Accordion</option>
                        <option>Grid</option>
                        <option>Cards</option>
                        <option>List</option>
                        <option>Icon Grid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Title</label>
                      <Input value={data.benefitsSectionTitle} onChange={(e) => update("benefitsSectionTitle", e.target.value)} placeholder="Why Choose Us?" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Benefits List</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, benefits: [...prev.benefits, { title: "", description: "" }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Benefit
                        </Button>
                      </div>
                      {data.benefits.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No benefits yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {data.benefits.map((b: any, i: number) => (
                            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Benefit {i + 1}</span>
                                <button onClick={() => update("benefits", data.benefits.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Benefit Title*</label>
                                <Input size={1} className="h-8 text-sm" value={b.title} onChange={(e) => { const next = [...data.benefits]; next[i] = { ...next[i], title: e.target.value }; update("benefits", next); }} placeholder="All-in-One Solution" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Benefit Description*</label>
                                <textarea className="flex w-full min-h-[60px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={b.description} onChange={(e) => { const next = [...data.benefits]; next[i] = { ...next[i], description: e.target.value }; update("benefits", next); }} placeholder="Describe this benefit..." />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "Social" && (
            <div className="space-y-4">
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(["Stats", "Gallery"] as const).map((t) => (
                  <button key={t} onClick={() => setSocialTab(t)}
                    className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
                      socialTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>{t}</button>
                ))}
              </div>

              {socialTab === "Stats" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Statistics Section</CardTitle>
                        <p className="text-xs text-muted-foreground">Key business metrics and numbers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.statsEnabled} onChange={() => update("statsEnabled", !data.statsEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-xl">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Stats Variant</label>
                      <select value={data.statsVariant} onChange={(e) => update("statsVariant", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Coloured Background</option>
                        <option>Cards</option>
                        <option>Minimal</option>
                        <option>Circular</option>
                        <option>Gradient</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Statistics</label>
                        <Button size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, stats: [...prev.stats, { label: "", value: 0 }] }))}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Add Statistic
                        </Button>
                      </div>
                      {data.stats.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No statistics yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.stats.map((s: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Label</label>
                                  <Input size={1} className="h-8 text-sm" value={s.label} onChange={(e) => { const next = [...data.stats]; next[i] = { ...next[i], label: e.target.value }; update("stats", next); }} placeholder="e.g. Active Users" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Value</label>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => { const next = [...data.stats]; next[i] = { ...next[i], value: next[i].value - 1 }; update("stats", next); }} className="flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-muted text-sm font-medium">−</button>
                                    <Input type="number" className="h-8 text-sm text-center" value={s.value} onChange={(e) => { const next = [...data.stats]; next[i] = { ...next[i], value: parseInt(e.target.value) || 0 }; update("stats", next); }} />
                                    <button onClick={() => { const next = [...data.stats]; next[i] = { ...next[i], value: next[i].value + 1 }; update("stats", next); }} className="flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-muted text-sm font-medium">+</button>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => update("stats", data.stats.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-600 flex-shrink-0"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}

              {socialTab === "Gallery" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Gallery Section</CardTitle>
                        <p className="text-xs text-muted-foreground">Manage gallery images displayed on your landing page</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={data.galleryEnabled} onChange={() => update("galleryEnabled", !data.galleryEnabled)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-2 text-sm font-medium">Enable Section</span>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 max-w-3xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Gallery Variant</label>
                        <select value={data.galleryVariant} onChange={(e) => update("galleryVariant", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                          <option>Slider</option>
                          <option>Grid</option>
                          <option>Stacked</option>
                          <option>Carousel</option>
                          <option>Lightbox</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Section Title</label>
                        <Input value={data.gallerySectionTitle} onChange={(e) => update("gallerySectionTitle", e.target.value)} className="rounded-xl" placeholder="See Our Platform in Action" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Section Subtitle</label>
                      <Input value={data.gallerySectionSubtitle} onChange={(e) => update("gallerySectionSubtitle", e.target.value)} className="rounded-xl" placeholder="Explore our intuitive interface" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="text-sm font-medium">Gallery Images</label>
                          <p className="text-xs text-muted-foreground">Upload up to 6 images for your gallery</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{data.galleryImages.filter(Boolean).length}/6 uploaded</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <label key={i} className="group relative aspect-video rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all overflow-hidden">
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                const next = [...data.galleryImages];
                                next[i] = url;
                                update("galleryImages", next);
                              }
                            }} />
                            {data.galleryImages[i] ? (
                              <>
                                <img src={data.galleryImages[i]} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-all group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                  <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <button type="button" onClick={(e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  const next = [...data.galleryImages]; next[i] = null; update("galleryImages", next);
                                }} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500">✕</button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                  <span className="text-[10px] text-white font-medium">Image {i + 1}</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-4">
                                <div className="h-10 w-10 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-all">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-xs font-medium block">Image {i + 1}</span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 block">Click to upload</span>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Recommended: 1920×1080 or 16:9 ratio</p>
                          <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WebP</p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save"}</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "Engagement" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">CTA Section</CardTitle>
                    <p className="text-xs text-muted-foreground">Customize your call-to-action section</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={data.ctaEnabled} onChange={() => update("ctaEnabled", !data.ctaEnabled)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ms-2 text-sm font-medium">Enable Section</span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium w-32 shrink-0">CTA Variant</label>
                  <select value={data.ctaVariant} onChange={(e) => update("ctaVariant", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                    <option>Centered</option>
                    <option>Split</option>
                    <option>Card</option>
                    <option>Gradient</option>
                    <option>Minimal</option>
                  </select>
                </div>
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <label className="text-sm font-medium w-32 shrink-0 pt-2">Main Title</label>
                    <Input value={data.ctaTitle} onChange={(e) => update("ctaTitle", e.target.value)} className="rounded-xl flex-1" placeholder="Ready to Transform Your Business?" />
                  </div>
                  <div className="flex items-start gap-4">
                    <label className="text-sm font-medium w-32 shrink-0 pt-2">Subtitle</label>
                    <textarea value={data.ctaSubtitle} onChange={(e) => update("ctaSubtitle", e.target.value)} className="flex w-full min-h-[60px] rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y flex-1" placeholder="Join thousands of businesses already using our platform." />
                  </div>
                </div>
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Buttons & Links</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium w-32 shrink-0">Primary Button Text</label>
                    <Input value={data.ctaPrimaryText} onChange={(e) => update("ctaPrimaryText", e.target.value)} className="rounded-xl flex-1" placeholder="Start Free Trial" />
                    <label className="text-sm font-medium w-28 shrink-0">Primary Link</label>
                    <Input value={data.ctaPrimaryLink} onChange={(e) => update("ctaPrimaryLink", e.target.value)} className="rounded-xl flex-1" placeholder="https://" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium w-32 shrink-0">Secondary Button Text</label>
                    <Input value={data.ctaSecondaryText} onChange={(e) => update("ctaSecondaryText", e.target.value)} className="rounded-xl flex-1" placeholder="Contact Sales" />
                    <label className="text-sm font-medium w-28 shrink-0">Secondary Link</label>
                    <Input value={data.ctaSecondaryLink} onChange={(e) => update("ctaSecondaryLink", e.target.value)} className="rounded-xl flex-1" placeholder="https://" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-sm font-medium">Live Preview — Changes reflect in real-time on your landing page</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">Preview</Button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "Theme Color" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Color Settings</CardTitle>
                <p className="text-xs text-muted-foreground">Customize the color scheme of your landing page</p>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                <div className="rounded-xl border border-border p-5 space-y-4 bg-muted/10">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Colors</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Primary</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={data.colors.primary} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, primary: e.target.value } }))} className="h-10 w-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5" />
                        <Input value={data.colors.primary} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, primary: e.target.value } }))} className="font-mono rounded-xl h-10" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Secondary</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={data.colors.secondary} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, secondary: e.target.value } }))} className="h-10 w-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5" />
                        <Input value={data.colors.secondary} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, secondary: e.target.value } }))} className="font-mono rounded-xl h-10" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Accent</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={data.colors.accent} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, accent: e.target.value } }))} className="h-10 w-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5" />
                        <Input value={data.colors.accent} onChange={(e) => setData((prev: any) => ({ ...prev, colors: { ...prev.colors, accent: e.target.value } }))} className="font-mono rounded-xl h-10" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color Presets</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Select a preset to quickly apply a color scheme, or customize individual colors above.</p>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {colorPresets.map((preset) => (
                      <button key={preset.name} onClick={() => setData((prev: any) => ({ ...prev, colors: { primary: preset.primary, secondary: preset.secondary, accent: preset.accent } }))}
                        className={cn("rounded-xl border-2 p-3 hover:bg-muted transition-all text-center group", data.colors.primary === preset.primary ? "border-primary ring-2 ring-primary/20 shadow-sm" : "border-border hover:border-muted-foreground/30")}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.primary }} />
                            <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.secondary }} />
                            <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "Page" && (
            <div className="space-y-4">
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(["Addon", "Pricing"] as const).map((t) => (
                  <button key={t} onClick={() => setPageTab(t)}
                    className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
                      pageTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>{t}</button>
                ))}
              </div>

              {pageTab === "Addon" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">Add-Ons Page Settings</CardTitle>
                        <p className="text-xs text-muted-foreground">Configure the add-ons listing page appearance and filters</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-2xl">
                    <div className="rounded-xl border border-border p-5 space-y-4 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Info</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium w-28 shrink-0">Page Title</label>
                        <Input value={data.addonPageTitle} onChange={(e) => update("addonPageTitle", e.target.value)} className="rounded-xl flex-1" placeholder="Premium Addons" />
                      </div>
                      <div className="flex items-start gap-4">
                        <label className="text-sm font-medium w-28 shrink-0 pt-2">Subtitle</label>
                        <textarea value={data.addonPageSubtitle} onChange={(e) => update("addonPageSubtitle", e.target.value)} className="flex w-full min-h-[60px] rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y flex-1" placeholder="Extend your platform with powerful premium modules" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium w-28 shrink-0">Empty State</label>
                        <Input value={data.addonEmptyState} onChange={(e) => update("addonEmptyState", e.target.value)} className="rounded-xl flex-1" placeholder="No addons available. Check back later." />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Settings</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Card Variant</label>
                          <select value={data.addonCardVariant} onChange={(e) => update("addonCardVariant", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option>Overlapping</option>
                            <option>Modern Gradient</option>
                            <option>Premium Glass</option>
                            <option>Horizontal</option>
                            <option>Colorful Floating</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Items Per Page</label>
                          <Input type="number" value={data.addonItemsPerPage} onChange={(e) => update("addonItemsPerPage", parseInt(e.target.value) || 12)} className="rounded-xl" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Default Price Type</label>
                          <select value={data.addonDefaultPriceType} onChange={(e) => update("addonDefaultPriceType", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option>Monthly</option>
                            <option>Yearly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border p-5 space-y-4 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filter Options</span>
                      </div>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={data.addonShowSearch} onChange={() => update("addonShowSearch", !data.addonShowSearch)} className="accent-primary h-4 w-4" />
                          <span className="text-sm">Show Search</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={data.addonShowPriceFilter} onChange={() => update("addonShowPriceFilter", !data.addonShowPriceFilter)} className="accent-primary h-4 w-4" />
                          <span className="text-sm">Show Price Filter</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={data.addonShowSort} onChange={() => update("addonShowSort", !data.addonShowSort)} className="accent-primary h-4 w-4" />
                          <span className="text-sm">Show Sort Options</span>
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save Changes"}</Button>
                  </CardContent>
                </Card>
              )}

              {pageTab === "Pricing" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">Pricing Page Settings</CardTitle>
                        <p className="text-xs text-muted-foreground">Configure pricing page display and options</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-w-2xl">
                    <div className="rounded-xl border border-border p-5 space-y-4 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Info</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium w-28 shrink-0">Page Title</label>
                        <Input value={data.pricingPageTitle} onChange={(e) => update("pricingPageTitle", e.target.value)} className="rounded-xl flex-1" placeholder="Choose Your Plan" />
                      </div>
                      <div className="flex items-start gap-4">
                        <label className="text-sm font-medium w-28 shrink-0 pt-2">Subtitle</label>
                        <textarea value={data.pricingPageSubtitle} onChange={(e) => update("pricingPageSubtitle", e.target.value)} className="flex w-full min-h-[60px] rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y flex-1" placeholder="Select the perfect plan for your business" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layout Options</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Pricing Card Variant</label>
                          <select value={data.pricingCardVariant} onChange={(e) => update("pricingCardVariant", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option>Standard</option>
                            <option>Premium</option>
                            <option>Minimal</option>
                            <option>Gradient</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Default Billing</label>
                          <select value={data.pricingDefaultBilling} onChange={(e) => update("pricingDefaultBilling", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option>Monthly</option>
                            <option>Yearly</option>
                            <option>Both</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Plans Per Row</label>
                          <Input type="number" value={data.pricingPlansPerRow} onChange={(e) => update("pricingPlansPerRow", parseInt(e.target.value) || 3)} className="rounded-xl" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Currency</label>
                          <select value={data.pricingCurrency} onChange={(e) => update("pricingCurrency", e.target.value)} className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                            <option>INR (₹)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={data.pricingShowDiscount} onChange={() => update("pricingShowDiscount", !data.pricingShowDiscount)} className="accent-primary h-4 w-4" />
                          <span className="text-sm">Show Annual Discount Badge</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={data.pricingShowFreeTrial} onChange={() => update("pricingShowFreeTrial", !data.pricingShowFreeTrial)} className="accent-primary h-4 w-4" />
                          <span className="text-sm">Show Free Trial</span>
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save Changes"}</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 sticky top-6">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full rounded-xl gap-2" variant="default">
                <Eye className="h-4 w-4" /> View Landing Page
              </Button>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl gap-2" variant="outline">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Mobile View
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="mx-3 mb-3 rounded-xl border border-border overflow-hidden bg-white" style={{ height: 480 }}>
                <div className="h-full overflow-y-auto">
                  {data.sectionEnabled["Header"] && (
                    <div className="px-3 py-2 flex items-center justify-between border-b">
                      <span className="text-xs font-bold text-gray-900">{data.headerCompanyName || "Company"}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">{data.headerCtaText || "Get Started"}</span>
                    </div>
                  )}
                  {data.sectionEnabled["Hero"] && data.heroEnabled && (
                    <div className="px-3 py-4 space-y-2 border-b">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{data.hero.title || "Hero Title"}</p>
                      <p className="text-[9px] text-gray-500 leading-relaxed">{(data.hero.subtitle || "").slice(0, 80)}...</p>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[9px] px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: data.colors.primary }}>{data.hero.primaryText || "Start Free Trial"}</span>
                        <span className="text-[9px] px-2 py-1 rounded border border-gray-300 text-gray-600 font-medium">{data.hero.secondaryText || "Login"}</span>
                      </div>
                    </div>
                  )}
                  {data.sectionEnabled["Stats"] && data.statsEnabled && (
                    <div className="grid grid-cols-4 gap-1 px-3 py-3 border-b">
                      {data.stats.length === 0 ? (
                        <div className="col-span-4 text-center text-[9px] text-gray-400 py-2">No stats configured</div>
                      ) : (
                        data.stats.slice(0, 4).map((s: any, i: number) => (
                          <div key={i} className="text-center">
                            <p className="text-xs font-bold text-gray-900">{s.value >= 1000 ? `${(s.value/1000).toFixed(0)}K+` : s.value}</p>
                            <p className="text-[7px] text-gray-500">{s.label}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {data.sectionEnabled["Features"] && data.featuresEnabled && (
                    <div className="px-3 py-3 border-b">
                      <p className="text-xs font-bold text-gray-900 mb-2">{data.featuresTitle || "Features"}</p>
                      {data.features.length === 0 ? (
                        <p className="text-[8px] text-gray-400">No features configured</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {data.features.slice(0, 4).map((f: any, i: number) => (
                            <div key={i} className="p-2 rounded-lg bg-gray-50">
                              <p className="text-[9px] font-semibold text-gray-900">{f.title}</p>
                              <p className="text-[7px] text-gray-500 mt-0.5">{(f.description || "").slice(0, 30)}...</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {data.sectionEnabled["Modules"] && data.modulesEnabled && (
                    <div className="px-3 py-3 border-b">
                      <p className="text-xs font-bold text-gray-900 mb-2">{data.modulesSectionTitle || "Modules"}</p>
                      {data.modules.length === 0 ? (
                        <p className="text-[8px] text-gray-400">No modules configured</p>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {data.modules.slice(0, 4).map((m: any, i: number) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: data.colors.primary + "15", color: data.colors.primary }}>{m.title ? m.title.split(" ")[0] : "Module"}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {data.sectionEnabled["Benefits"] && data.benefitsEnabled && (
                    <div className="px-3 py-3 border-b">
                      <p className="text-xs font-bold text-gray-900 mb-2">{data.benefitsSectionTitle || "Why Choose Us?"}</p>
                      {data.benefits.length === 0 ? (
                        <p className="text-[8px] text-gray-400">No benefits configured</p>
                      ) : (
                        data.benefits.slice(0, 3).map((b: any, i: number) => (
                          <div key={i} className="py-1.5 border-b border-gray-100 last:border-0">
                            <p className="text-[9px] font-medium text-gray-900">{b.title || `Benefit ${i + 1}`}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {data.sectionEnabled["Gallery"] && data.galleryEnabled && (
                    <div className="px-3 py-3 border-b">
                      <p className="text-xs font-bold text-gray-900 mb-2">{data.gallerySectionTitle || "Gallery"}</p>
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: Math.min(data.galleryImages.filter(Boolean).length || 3, 3) }).map((_, n) => (
                          <div key={n} className="aspect-video rounded bg-gray-100 flex items-center justify-center">
                            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.sectionEnabled["CTA"] && data.ctaEnabled && (
                    <div className="px-3 py-4 border-b text-center space-y-2">
                      <p className="text-xs font-bold text-gray-900">{data.ctaTitle || "Ready to Start?"}</p>
                      <div className="flex gap-2 justify-center">
                        <span className="text-[9px] px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: data.colors.primary }}>{data.ctaPrimaryText || "Get Started"}</span>
                        <span className="text-[9px] px-2 py-1 rounded border border-gray-300 text-gray-600 font-medium">{data.ctaSecondaryText || "Learn More"}</span>
                      </div>
                    </div>
                  )}
                  {data.sectionEnabled["Footer"] && data.footerEnabled && (
                    <div className="px-3 py-3 bg-gray-900 text-white space-y-2">
                      <p className="text-xs font-bold">{data.headerCompanyName || "Company"}</p>
                      <p className="text-[8px] text-gray-400">{data.footer.description || "Company description"}</p>
                      {data.footerNavSections.length > 0 && (
                        <div className="flex gap-3 pt-1">
                          {data.footerNavSections.slice(0, 3).map((s: any, i: number) => (
                            <div key={i}>
                              <p className="text-[8px] font-semibold text-gray-300">{s.title || "Section"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[7px] text-gray-500 pt-1 border-t border-gray-700">{data.footer.copyright || "© Company. All rights reserved."}</p>
                    </div>
                  )}
                  <div className="px-3 py-2 text-center text-[8px] text-gray-400 bg-gray-50">
                    {sectionOrderItems.filter((s: string) => data.sectionEnabled[s]).length} sections active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
