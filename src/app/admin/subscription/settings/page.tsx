"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Search, Puzzle, ShieldCheck, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";

export default function SubscriptionSettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addonSearch, setAddonSearch] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("Pre Package Subscription");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    packageMonthly: "", packageYearly: "", perUserMonthly: "", perUserYearly: "", perGbMonthly: "", perGbYearly: "",
  });
  const [pricingMode, setPricingMode] = useState<"monthly" | "yearly">("yearly");
  const [showAddonPricingForm, setShowAddonPricingForm] = useState(false);
  const [editAddonName, setEditAddonName] = useState("");
  const [addonPricingForm, setAddonPricingForm] = useState({
    name: "", monthlyPrice: "", yearlyPrice: "", image: null as File | null,
  });
  const [planForm, setPlanForm] = useState({
    name: "", maxUsers: "", storageLimit: "", description: "", active: true, trial: false, free: false,
    monthlyPrice: "", yearlyPrice: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [sessionData, plansData, addonsData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/subscription-plans").then((r) => r.json()),
        fetch("/api/admin/addons").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setPlans(plansData.plans || []);
      setAddons(addonsData.addons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (plan: any) => {
    setPlanForm({
      name: plan.name,
      maxUsers: "",
      storageLimit: "",
      description: plan.description || "",
      active: plan.isActive ?? true,
      trial: (plan.trialDays ?? 0) > 0,
      free: plan.price === 0,
      monthlyPrice: plan.interval === "MONTHLY" ? String(plan.price) : "",
      yearlyPrice: plan.interval === "YEARLY" ? String(plan.price) : "",
    });
    setEditMode(plan.id);
    setShowForm(true);
  };

  const handleSavePlan = async () => {
    if (!planForm.name) return;
    setSaving(true);
    const interval = planForm.monthlyPrice ? "MONTHLY" : "YEARLY";
    const price = Number(planForm.monthlyPrice || planForm.yearlyPrice || 0);
    const payload = {
      name: planForm.name,
      description: planForm.description,
      price,
      interval,
      trialDays: planForm.trial ? 14 : 0,
      isActive: planForm.active,
    };

    try {
      if (editMode) {
        await fetch(`/api/admin/subscription-plans/${editMode}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/subscription-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await fetchData();
      setShowForm(false);
      setEditMode(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await fetch(`/api/admin/subscription-plans/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAllAddons = () => setSelectedAddons(new Set(addons.map((a: any) => a.name)));
  const deselectAllAddons = () => setSelectedAddons(new Set());

  const addonOptions = addons.map((a: any) => a.name);
  const filteredAddons = addonOptions.filter((a: string) =>
    a.toLowerCase().includes(addonSearch.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Subscription Settings" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Subscription Settings" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Subscription Settings</h2>
            <p className="text-muted-foreground text-sm">Manage subscription plans and pricing</p>
          </div>
          <Button onClick={() => { setEditMode(null); setPlanForm({ name: "", maxUsers: "", storageLimit: "", description: "", active: true, trial: false, free: false, monthlyPrice: "", yearlyPrice: "" }); setShowForm(true); }} size="icon" className="h-9 w-9">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
            {["Pre Package Subscription", "Usage Subscription"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                data-active={activeTab === tab}
                className="px-5 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm font-medium"
              >{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === "Pre Package Subscription" ? (
          <>
            <div className="flex justify-center">
              <div className="inline-flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
                {(["monthly", "yearly"] as const).map((mode) => (
                  <button key={mode} onClick={() => setPricingMode(mode)}
                    data-active={pricingMode === mode}
                    className="px-4 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm font-medium capitalize"
                  >{mode}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const monthlyPrice = plan.interval === "MONTHLY" ? plan.price : plan.price / 12;
                const yearlyPrice = plan.interval === "YEARLY" ? plan.price : plan.price * 12;
                return (
                  <div key={plan.id} className="relative bg-card border rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePlan(plan.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-bold mt-2">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{plan.description || ""}</p>
                    <div className="mt-4 flex items-baseline gap-0.5">
                      <span className="text-3xl font-extrabold">
                        ${pricingMode === "monthly" ? monthlyPrice.toFixed(0) : yearlyPrice.toFixed(0)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {pricingMode === "monthly" ? "/mo" : "/yr"}
                      </span>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                      {plan.features?.map((f: string, i: number) => (
                        <p key={i}>{f}</p>
                      )) || <p>No features listed</p>}
                    </div>
                    {plan.trialDays ? (
                      <p className="mt-2 text-xs text-primary font-medium">{plan.trialDays}d trial</p>
                    ) : null}
                    <div className="mt-auto pt-4 w-full">
                      <div className={`h-9 rounded-lg border flex items-center justify-center text-sm font-medium ${plan.isActive ? "border-green-200 text-green-600 bg-green-50" : "border-input text-muted-foreground"}`}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Add-Ons</h4>
              <div className="grid grid-cols-4 gap-3">
                {addons.map((addon: any) => (
                  <div key={addon.id} className="bg-card border rounded-xl px-3 py-2 flex items-center gap-2 text-sm">
                    <Puzzle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{addon.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Custom Plan</h3>
                <p className="text-xs text-muted-foreground mt-1">Tailored solution for specific business needs</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowPricingForm(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit Pricing
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center bg-card border rounded-xl px-8 py-4">
                <p className="text-xs text-muted-foreground">Yearly Package</p>
                <p className="text-lg font-bold">{pricingForm.packageYearly || "$0.00"}</p>
              </div>
              <div className="text-center bg-card border rounded-xl px-8 py-4">
                <p className="text-xs text-muted-foreground">Per User Yearly</p>
                <p className="text-lg font-bold">{pricingForm.perUserYearly || "$0.00"}</p>
              </div>
              <div className="text-center bg-card border rounded-xl px-8 py-4">
                <p className="text-xs text-muted-foreground">Per Storage Yearly</p>
                <p className="text-lg font-bold">{pricingForm.perGbYearly || "$0.00"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Active Add-Ons</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search add-ons..." className="pl-9 h-9" value={addonSearch} onChange={(e) => setAddonSearch(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {filteredAddons.length === 0 ? (
                  <div className="col-span-3 text-center text-sm text-muted-foreground py-4">No add-ons found</div>
                ) : (
                  filteredAddons.map((addon: string) => (
                    <div key={addon} className="bg-card border rounded-xl p-3 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Puzzle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{addon}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 -mr-1 -mt-1"
                          onClick={() => { setEditAddonName(addon); setAddonPricingForm({ name: addon, monthlyPrice: "", yearlyPrice: "", image: null }); setShowAddonPricingForm(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => { setShowForm(false); setEditMode(null); }} />
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center gap-4 px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted" onClick={() => { setShowForm(false); setEditMode(null); }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{editMode ? "Edit Plan" : "Create Plan"}</h3>
                  <p className="text-xs text-muted-foreground">{editMode ? "Modify existing subscription plan" : "Design a new subscription plan"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{selectedAddons.size} add-ons</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted" onClick={() => { setShowForm(false); setEditMode(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="border rounded-2xl p-6 space-y-5 bg-card shadow-sm">
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Plan Information</h4>
                          <p className="text-[11px] text-muted-foreground">Basic details and limits</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Plan Name <span className="text-destructive">*</span></label>
                        <Input placeholder="e.g., Basic, Pro, Enterprise" className="h-10" value={planForm.name} onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Description</label>
                        <textarea className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y"
                          placeholder="Describe what this plan includes..." value={planForm.description}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))} />
                      </div>
                    </div>

                    <div className="border rounded-2xl p-6 space-y-5 bg-card shadow-sm">
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Puzzle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Available Add-Ons</h4>
                          <p className="text-[11px] text-muted-foreground">Select modules included in this plan</p>
                        </div>
                        <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{selectedAddons.size} selected</span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search add-ons..." className="pl-9 h-10 rounded-xl" value={addonSearch} onChange={(e) => setAddonSearch(e.target.value)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <button className="text-primary font-medium hover:underline" onClick={selectAllAddons}>Select All</button>
                          <span className="text-muted-foreground/40">|</span>
                          <button className="text-muted-foreground hover:text-foreground" onClick={deselectAllAddons}>Select None</button>
                        </div>
                        <span className="text-xs text-muted-foreground">{filteredAddons.length} add-ons available</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                        {filteredAddons.length === 0 ? (
                          <div className="col-span-2 text-center text-sm text-muted-foreground py-8">No add-ons found</div>
                        ) : (
                          filteredAddons.map((addon: string) => {
                            const isSelected = selectedAddons.has(addon);
                            return (
                              <label key={addon} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm shadow-primary/5" : "border-border hover:border-muted-foreground/30 hover:bg-muted/20"}`}>
                                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                                  {isSelected && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" checked={isSelected} onChange={() => toggleAddon(addon)} className="sr-only" />
                                <Puzzle className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="text-sm truncate">{addon}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border rounded-2xl p-6 bg-card shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Live Preview</span>
                      </div>
                      <div className={`rounded-xl border-2 p-5 text-center space-y-4 transition-all ${planForm.active ? "border-primary/20 bg-primary/[0.02]" : "border-muted/50"}`}>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{planForm.name || "Plan Name"}</p>
                          <p className="text-3xl font-bold mt-1">
                            <span className="text-lg align-top">$</span>
                            {planForm.monthlyPrice || "0"}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                          </p>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Users</span>
                            <span className="font-medium">{planForm.maxUsers || "∞"}</span>
                          </div>
                          <div className="flex justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Storage</span>
                            <span className="font-medium">{planForm.storageLimit || "∞"} GB</span>
                          </div>
                          <div className="flex justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">Add-Ons</span>
                            <span className="font-medium">{selectedAddons.size}</span>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planForm.trial ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>Trial</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planForm.free ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>Free</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 space-y-4 bg-card shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <h4 className="font-semibold text-sm">Quick Settings</h4>
                      </div>
                      {(["active", "trial", "free"] as const).map((key) => (
                        <div key={key} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium capitalize">{key}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {key === "active" ? "Plan is available for purchase" : key === "trial" ? "Free trial period available" : "Plan is free of cost"}
                            </p>
                          </div>
                          <button type="button" onClick={() => setPlanForm((prev) => ({ ...prev, [key]: !prev[key] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${planForm[key] ? "bg-primary shadow-sm shadow-primary/30" : "bg-input"}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all ${planForm[key] ? "translate-x-[24px]" : "translate-x-[2px]"}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border rounded-2xl p-5 space-y-4 bg-card shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h4 className="font-semibold text-sm">Pricing</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Monthly Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                            <Input className="pl-7 h-10 rounded-xl" type="number" placeholder="0.00" value={planForm.monthlyPrice} onChange={(e) => setPlanForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Yearly Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                            <Input className="pl-7 h-10 rounded-xl" type="number" placeholder="0.00" value={planForm.yearlyPrice} onChange={(e) => setPlanForm((prev) => ({ ...prev, yearlyPrice: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/20">
              <p className="text-xs text-muted-foreground">Changes are saved to the database</p>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => { setShowForm(false); setEditMode(null); }}>Cancel</Button>
                <Button className="rounded-xl gap-1.5" disabled={saving} onClick={handleSavePlan}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {editMode ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showPricingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold">Edit Plan Pricing - Custom Plan</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPricingForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "packageMonthly", label: "Package Price (Monthly)" },
                { key: "packageYearly", label: "Package Price (Yearly)" },
                { key: "perUserMonthly", label: "Price Per User (Monthly)" },
                { key: "perUserYearly", label: "Price Per User (Yearly)" },
                { key: "perGbMonthly", label: "Price Per GB (Monthly)" },
                { key: "perGbYearly", label: "Price Per GB (Yearly)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-1 block">{label}</label>
                  <Input type="number" placeholder="$0.00" value={(pricingForm as any)[key]}
                    onChange={(e) => setPricingForm((prev) => ({ ...prev, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
              <Button variant="outline" onClick={() => setShowPricingForm(false)}>Cancel</Button>
              <Button onClick={() => { setShowPricingForm(false); }}>Save Pricing</Button>
            </div>
          </div>
        </div>
      )}

      {showAddonPricingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold">Edit Add-On Price - {editAddonName}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddonPricingForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <p className="text-xs text-muted-foreground px-5 pt-3">Update module details including name, image, and pricing</p>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Add-On Name</label>
                <Input value={addonPricingForm.name} onChange={(e) => setAddonPricingForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Add-On Image</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="relative">
                    Choose File
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"
                      onChange={(e) => { const file = e.target.files?.[0] || null; setAddonPricingForm((prev) => ({ ...prev, image: file })); }} />
                  </Button>
                  <span className="text-sm text-muted-foreground">{addonPricingForm.image ? addonPricingForm.image.name : "No file chosen"}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Price</label>
                <Input type="number" placeholder="$0.00" value={addonPricingForm.monthlyPrice} onChange={(e) => setAddonPricingForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Yearly Price</label>
                <Input type="number" placeholder="$0.00" value={addonPricingForm.yearlyPrice} onChange={(e) => setAddonPricingForm((prev) => ({ ...prev, yearlyPrice: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
              <Button variant="outline" onClick={() => setShowAddonPricingForm(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddonPricingForm(false); }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
