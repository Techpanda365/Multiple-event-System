"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Select Category",
  "Computer Equipment",
  "Electronics",
  "Office Furniture",
  "Vehicles",
  "Machinery",
  "Network Equipment",
  "Mobile Devices",
  "Tools & Equipment",
  "Building Infrastructure",
  "Software Licenses",
  "Other",
];

const LOCATIONS = [
  "Select Location",
  "Main Office Building (MOB-001)",
  "Warehouse District A (WDA-001)",
  "Tech Campus Site (TCS-001)",
  "Floor 2 - East Wing",
  "Floor 3 - West Wing",
  "Server Room B1",
];

export default function CreateAssetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", purchaseDate: "", supportedDate: "", category: "Select Category",
    serialCode: "", quantity: "0", unitPrice: "", warrantyPeriod: "",
    location: "Select Location", description: "", image: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const quantity = Number(form.quantity) || 0;
  const unitPrice = Number(form.unitPrice) || 0;
  const purchaseCost = quantity * unitPrice;

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { setError("Asset name is required"); return; }
    if (!form.purchaseDate) { setError("Purchase date is required"); return; }
    if (form.category === "Select Category") { setError("Please select a category"); return; }
    if (!form.serialCode.trim()) { setError("Serial code is required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          purchaseDate: form.purchaseDate || null,
          supportedDate: form.supportedDate || null,
          category: form.category === "Select Category" ? "general" : form.category,
          serialNumber: form.serialCode.trim(),
          quantity: quantity,
          unitPrice: unitPrice || null,
          purchasePrice: purchaseCost || null,
          warrantyPeriod: form.warrantyPeriod.trim() || null,
          location: form.location === "Select Location" ? null : form.location,
          description: form.description.trim() || null,
          image: form.image.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create asset"); return; }
      router.push("/dashboard/assets");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Asset">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/assets")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Asset</h1><p className="text-sm text-muted-foreground">Add a new asset to the register</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Asset Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <Input placeholder="Enter Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Purchase Date <span className="text-destructive">*</span></label>
                <Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Supported Date</label>
                <Input type="date" value={form.supportedDate} onChange={(e) => set("supportedDate", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Serial Code <span className="text-destructive">*</span></label>
              <Input placeholder="Enter Serial Code" value={form.serialCode} onChange={(e) => set("serialCode", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quantity</label>
                <Input type="number" min={0} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Unit Price <span className="text-destructive">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" min={0} step={0.01} placeholder="0.00" className="pl-7" value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Purchase Cost</label>
              <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 text-sm font-medium text-muted-foreground">
                ${purchaseCost.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Warranty Period</label>
              <Input placeholder="Enter Warranty Period" value={form.warrantyPeriod} onChange={(e) => set("warrantyPeriod", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <select value={form.location} onChange={(e) => set("location", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
                placeholder="Enter Description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Image</label>
              <div className="flex items-center gap-3 p-3 border border-dashed rounded-lg">
                <input type="text" placeholder="Select Image..." className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.image} onChange={(e) => set("image", e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("image-upload")?.click()}>Browse</Button>
                <input id="image-upload" type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) set("image", file.name);
                  }} />
                {form.image && <Button type="button" variant="ghost" size="sm" onClick={() => set("image", "")}>Cancel</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/assets")} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Create"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
