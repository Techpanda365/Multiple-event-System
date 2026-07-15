"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, GripVertical, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [userData, setUserData] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/addons").then((r) => r.json()),
    ])
      .then(([session, addonsRes]) => {
        if (session.user) setUserData(session.user);
        if (addonsRes.data?.addons) setAddons(addonsRes.data.addons);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredAddons = addons.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Marketplace" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Settings</h2>
          <p className="text-muted-foreground text-sm">Manage marketplace add-on configurations</p>
        </div>

        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-base">Active Add-Ons</h3>
              <p className="text-xs text-muted-foreground">
                Select addon to configure marketplace settings
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search addons..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-card border rounded-lg max-h-[calc(100vh-320px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAddons.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No addons found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAddons.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => setSelectedAddon(addon.name)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                        selectedAddon === addon.name
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground"
                      )}
                    >
                      {addon.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {selectedAddon ? (
              <MarketplaceAddonSettings addon={selectedAddon} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-card border rounded-lg text-center p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">Select an Add-On</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Choose an add-on from the left sidebar to configure its marketplace settings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const tabs = ["Setup", "Content", "Social"] as const;
type TabType = (typeof tabs)[number];

function MarketplaceAddonSettings({ addon }: { addon: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("Setup");

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">{addon}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure marketplace settings for this add-on
        </p>
      </div>

      <div className="border-b px-6 mt-4">
        <div className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "Setup" && <SetupTab />}
        {activeTab === "Content" && <ContentTab />}
        {activeTab === "Social" && <SocialTab />}
      </div>
    </div>
  );
}

function SetupTab() {
  const [setupTab, setSetupTab] = useState<"Hero" | "Order">("Hero");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["Hero", "Order"] as const).map((t) => (
          <button key={t} onClick={() => setSetupTab(t)}
            className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
              setupTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
        ))}
      </div>

      {setupTab === "Hero" && <HeroSetupTab />}
      {setupTab === "Order" && <OrderSetupTab />}
    </div>
  );
}

const sectionOrderItems = [
  "Header", "Hero", "Stats", "Features", "Modules", "Benefits", "Gallery", "CTA", "Footer"
];

function OrderSetupTab() {
  const [sectionEnabled, setSectionEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(sectionOrderItems.map((s) => [s, true]))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Section Order</CardTitle>
        <p className="text-xs text-muted-foreground">Enable or disable sections for this add-on</p>
      </CardHeader>
      <CardContent className="space-y-2 max-w-xl">
        {sectionOrderItems.map((section, i) => (
          <div key={section} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
            <span className="text-sm flex-1">{i + 1}. {section}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sectionEnabled[section]}
                onChange={() => setSectionEnabled((p) => ({ ...p, [section]: !p[section] }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-2 text-xs text-muted-foreground">
                {sectionEnabled[section] ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HeroSetupTab() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroVariant, setHeroVariant] = useState("Image Left Split");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("");
  const [secondaryBtnText, setSecondaryBtnText] = useState("");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("");
  const [heroImage, setHeroImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHeroImage(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Hero Section</CardTitle>
              <p className="text-xs text-muted-foreground">Configure the hero banner for this add-on</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">Setup</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Add-on title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hero Variant</label>
            <select
              value={heroVariant}
              onChange={(e) => setHeroVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Image Left Split</option>
              <option>Image Right Split</option>
              <option>Background Image</option>
              <option>Minimal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hero Title</label>
            <Input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} placeholder="Hero headline" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hero Subtitle</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Hero subtitle description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Primary Button Text</label>
              <Input value={primaryBtnText} onChange={(e) => setPrimaryBtnText(e.target.value)} placeholder="Button text" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Primary Button Link</label>
              <Input value={primaryBtnLink} onChange={(e) => setPrimaryBtnLink(e.target.value)} placeholder="#install" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Secondary Button Text</label>
              <Input value={secondaryBtnText} onChange={(e) => setSecondaryBtnText(e.target.value)} placeholder="Button text" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Secondary Button Link</label>
              <Input value={secondaryBtnLink} onChange={(e) => setSecondaryBtnLink(e.target.value)} placeholder="#learn" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hero Image</label>
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  {heroImage ? "Change Image" : "Upload Image"}
                </div>
              </label>
              {heroImage && (
                <button onClick={() => setHeroImage(null)} className="text-xs text-destructive hover:underline">
                  Remove
                </button>
              )}
            </div>
            {heroImage && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-border w-48 h-28">
                <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline">Reset</Button>
        <Button>Save Setup</Button>
      </div>
    </div>
  );
}

function ContentTab() {
  const [contentTab, setContentTab] = useState<"Modules" | "Dedication">("Modules");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["Modules", "Dedication"] as const).map((t) => (
          <button key={t} onClick={() => setContentTab(t)}
            className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
              contentTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
        ))}
      </div>

      {contentTab === "Modules" && <ModulesContentTab />}
      {contentTab === "Dedication" && <DedicationContentTab />}
    </div>
  );
}

function ModulesContentTab() {
  const [variant, setVariant] = useState("Grid");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [cardVariant, setCardVariant] = useState("default");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Modules Settings</CardTitle>
          <p className="text-xs text-muted-foreground">Configure how modules are displayed</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Modules Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Grid</option>
              <option>Cards</option>
              <option>List</option>
              <option>Slider</option>
              <option>Masonry</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Title</label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Section title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Subtitle</label>
            <textarea
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Section subtitle"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Card Variant</label>
            <select
              value={cardVariant}
              onChange={(e) => setCardVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Overlapping</option>
              <option>Modern Gradient</option>
              <option>Premium Glass</option>
              <option>Horizontal</option>
              <option>Color Floating</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline">Reset</Button>
        <Button>Save Modules</Button>
      </div>
    </div>
  );
}

function DedicationContentTab() {
  const [variant, setVariant] = useState("Alternating");
  const [sectionTitle, setSectionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subSections, setSubSections] = useState<{ title: string; description: string; keyPoints: string; screenshot: string | null }[]>([]);

  const addSubSection = () => {
    setSubSections((prev) => [...prev, { title: "", description: "", keyPoints: "", screenshot: null }]);
  };

  const removeSubSection = (index: number) => {
    setSubSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSubSection = (index: number, field: string, value: string | null) => {
    setSubSections((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Dedication Settings</CardTitle>
          <p className="text-xs text-muted-foreground">Configure dedication section layout</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Dedication Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Alternating</option>
              <option>Left Aligned</option>
              <option>Right Aligned</option>
              <option>Centered</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Title</label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Section title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Section description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Sub Sections</CardTitle>
              <p className="text-xs text-muted-foreground">Manage dedication sub-section items</p>
            </div>
            <Button variant="outline" size="sm" onClick={addSubSection}>+ Add Sub Section</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subSections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sub sections yet. Click "+ Add Sub Section" to create one.</p>
          ) : (
            subSections.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {i + 1}</span>
                  <button onClick={() => removeSubSection(i)} className="text-xs text-destructive hover:underline">
                    Remove
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sub Section Title *</label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateSubSection(i, "title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateSubSection(i, "description", e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Section description"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Key Points</label>
                  <textarea
                    value={item.keyPoints}
                    onChange={(e) => updateSubSection(i, "keyPoints", e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="One point per line"
                  />
                  <p className="text-[10px] text-muted-foreground">Enter one key point per line</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Screenshot</label>
                  <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer">
                      <input
                        type="file" accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateSubSection(i, "screenshot", URL.createObjectURL(file));
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4" />
                        {item.screenshot ? "Change Image" : "Upload Image"}
                      </div>
                    </label>
                    {item.screenshot && (
                      <button onClick={() => updateSubSection(i, "screenshot", null)} className="text-xs text-destructive hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                  {item.screenshot && (
                    <div className="mt-2 relative rounded-md overflow-hidden border border-border w-48 h-28">
                      <img src={item.screenshot} alt="Screenshot preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline">Reset</Button>
        <Button>Save Dedication</Button>
      </div>
    </div>
  );
}

function SocialTab() {
  const [socialTab, setSocialTab] = useState<"Screenshots" | "WhyChoose">("Screenshots");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["Screenshots", "Why Choose"] as const).map((t) => (
          <button key={t} onClick={() => setSocialTab(t === "Why Choose" ? "WhyChoose" : "Screenshots")}
            className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors",
              (t === "Why Choose" ? socialTab === "WhyChoose" : socialTab === t)
                ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
        ))}
      </div>

      {socialTab === "Screenshots" && <ScreenshotsTab />}
      {socialTab === "WhyChoose" && <WhyChooseTab />}
    </div>
  );
}

function ScreenshotsTab() {
  const [variant, setVariant] = useState("Grid");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const addScreenshot = () => setScreenshots((prev) => [...prev, ""]);
  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpload = (index: number, file: File | null) => {
    if (file) {
      setScreenshots((prev) => prev.map((item, i) => i === index ? URL.createObjectURL(file) : item));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Screenshots Settings</CardTitle>
          <p className="text-xs text-muted-foreground">Configure screenshot gallery display</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Screenshots Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Grid</option>
              <option>Carousel</option>
              <option>Masonry</option>
              <option>List</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Title</label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Section title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Subtitle</label>
            <textarea
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Section subtitle"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
              <p className="text-xs text-muted-foreground">Upload screenshot images for this add-on</p>
            </div>
            <Button variant="outline" size="sm" onClick={addScreenshot}>+ Add Screenshot</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {screenshots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No screenshots yet. Click "+ Add Screenshot" to add one.</p>
          ) : (
            screenshots.map((src, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {i + 1}</span>
                  <button onClick={() => removeScreenshot(i)} className="text-xs text-destructive hover:underline">Remove</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Screenshot Image *</label>
                  <div className="flex items-center gap-3">
                    <label className="relative cursor-pointer">
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(i, e.target.files?.[0] ?? null)} className="sr-only" />
                      <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4" />
                        {src ? "Change" : "Browse"}
                      </div>
                    </label>
                    {src && (
                      <button onClick={() => {
                        setScreenshots((prev) => prev.map((item, idx) => idx === i ? "" : item));
                      }} className="text-xs text-destructive hover:underline">Remove</button>
                    )}
                  </div>
                </div>

                {src && (
                  <div className="rounded-md overflow-hidden border border-border w-full max-w-sm h-40">
                    <img src={src} alt={`Screenshot ${i + 1} preview`} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline">Reset</Button>
        <Button>Save Screenshots</Button>
      </div>
    </div>
  );
}

function WhyChooseTab() {
  const [variant, setVariant] = useState("Grid");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [benefits, setBenefits] = useState<{ title: string; description: string; icon: string; color: string }[]>([]);

  const addBenefit = () => setBenefits((prev) => [...prev, { title: "", description: "", icon: "", color: "#6366f1" }]);
  const removeBenefit = (index: number) => setBenefits((prev) => prev.filter((_, i) => i !== index));
  const updateBenefit = (index: number, field: "title" | "description" | "icon" | "color", value: string) => {
    setBenefits((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Why Choose Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Why Choose Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>Grid</option>
              <option>List</option>
              <option>Cards</option>
              <option>Minimal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Title</label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Section title" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section Subtitle</label>
            <textarea
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Section subtitle"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Benefits</CardTitle>
              <p className="text-xs text-muted-foreground">Add key benefits for choosing this add-on</p>
            </div>
            <Button variant="outline" size="sm" onClick={addBenefit}>+ Add Benefit</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {benefits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No benefits yet. Click "+ Add Benefit" to add one.</p>
          ) : (
            benefits.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {i + 1}</span>
                  <button onClick={() => removeBenefit(i)} className="text-xs text-destructive hover:underline">Remove</button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Benefit Title *</label>
                  <Input value={item.title} onChange={(e) => updateBenefit(i, "title", e.target.value)} placeholder="Benefit title" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateBenefit(i, "description", e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Benefit description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Icon</label>
                    <Input value={item.icon} onChange={(e) => updateBenefit(i, "icon", e.target.value)} placeholder="e.g. Bot, Shield, Zap" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => updateBenefit(i, "color", e.target.value)}
                        className="h-9 w-9 rounded-md border border-input cursor-pointer bg-transparent"
                      />
                      <Input
                        value={item.color}
                        onChange={(e) => updateBenefit(i, "color", e.target.value)}
                        placeholder="#6366f1"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline">Reset</Button>
        <Button>Save Why Choose</Button>
      </div>
    </div>
  );
}
