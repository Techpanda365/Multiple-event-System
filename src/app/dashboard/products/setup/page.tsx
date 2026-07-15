"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Package, DollarSign, Ruler, Loader2 } from "lucide-react";

type Tab = "category" | "tax" | "unit";

type Category = { id: string; name: string; color: string };
type Tax = { id: string; name: string; rate: number; isActive: boolean };
type Unit = { id: string; name: string };

const sidebarItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "category", label: "Category", icon: <Package className="h-4 w-4" /> },
  { key: "tax", label: "% Taxes", icon: <DollarSign className="h-4 w-4" /> },
  { key: "unit", label: "Units", icon: <Ruler className="h-4 w-4" /> },
];

const colorOptions = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];

export default function ProductsSetupPage() {
  const [activeTab, setActiveTab] = useState<Tab>("category");
  const [loading, setLoading] = useState(true);

  // Category
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [editCat, setEditCat] = useState<Category | null>(null);

  // Tax
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [editTax, setEditTax] = useState<Tax | null>(null);

  // Unit
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitName, setUnitName] = useState("");
  const [editUnit, setEditUnit] = useState<Unit | null>(null);

  const apiPath = activeTab === "category" ? "/api/product-categories" : activeTab === "tax" ? "/api/taxes" : "/api/units";

  useEffect(() => {
    setLoading(true);
    fetch(apiPath)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (activeTab === "category") setCategories(list);
        else if (activeTab === "tax") setTaxes(list);
        else setUnits(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleCreate = async () => {
    let body: Record<string, unknown> = {};
    if (activeTab === "category") {
      if (!catName.trim()) return;
      body = { name: catName.trim(), color: catColor };
    } else if (activeTab === "tax") {
      if (!taxName.trim()) return;
      body = { name: taxName.trim(), rate: taxRate };
    } else {
      if (!unitName.trim()) return;
      body = { name: unitName.trim() };
    }

    if (editCat || editTax || editUnit) {
      const editId = editCat?.id || editTax?.id || editUnit?.id;
      const res = await fetch(`${apiPath}/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        if (activeTab === "category") setCategories((prev) => prev.map((c) => (c.id === editId ? updated : c)));
        else if (activeTab === "tax") setTaxes((prev) => prev.map((t) => (t.id === editId ? updated : t)));
        else setUnits((prev) => prev.map((u) => (u.id === editId ? updated : u)));
      }
    } else {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        if (activeTab === "category") setCategories((prev) => [...prev, created]);
        else if (activeTab === "tax") setTaxes((prev) => [...prev, created]);
        else setUnits((prev) => [...prev, created]);
      }
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (activeTab === "category") setCategories((prev) => prev.filter((c) => c.id !== id));
      else if (activeTab === "tax") setTaxes((prev) => prev.filter((t) => t.id !== id));
      else setUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const resetForm = () => {
    setCatName(""); setCatColor("#3b82f6"); setEditCat(null);
    setTaxName(""); setTaxRate(0); setEditTax(null);
    setUnitName(""); setEditUnit(null);
  };

  const startEdit = (item: Category | Tax | Unit) => {
    if (activeTab === "category") {
      const c = item as Category;
      setCatName(c.name); setCatColor(c.color); setEditCat(c);
    } else if (activeTab === "tax") {
      const t = item as Tax;
      setTaxName(t.name); setTaxRate(t.rate); setEditTax(t);
    } else {
      const u = item as Unit;
      setUnitName(u.name); setEditUnit(u);
    }
  };

  const currentList = activeTab === "category" ? categories : activeTab === "tax" ? taxes : units;
  const editing = editCat || editTax || editUnit;

  return (
    <DashboardLayout title="System Setup">
      <div className="p-4 md:p-6 bg-background">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">System Setup</h1>
          <p className="text-sm text-muted-foreground">Manage categories, taxes, and units</p>
        </div>

        <div className="flex gap-6">
          <div className="w-48 shrink-0 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); resetForm(); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === item.key ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-6">
            {loading && currentList.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{editing ? "Edit" : "Create"} {activeTab === "category" ? "Category" : activeTab === "tax" ? "Tax" : "Unit"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                        <Input className="mt-1" placeholder="Enter name" value={activeTab === "category" ? catName : activeTab === "tax" ? taxName : unitName}
                          onChange={(e) => {
                            if (activeTab === "category") setCatName(e.target.value);
                            else if (activeTab === "tax") setTaxName(e.target.value);
                            else setUnitName(e.target.value);
                          }} required />
                      </div>
                      {activeTab === "category" && (
                        <div>
                          <label className="text-sm font-medium">Color</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {colorOptions.map((c) => (
                              <button key={c} type="button" onClick={() => setCatColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${catColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === "tax" && (
                        <div>
                          <label className="text-sm font-medium">Rate (%)</label>
                          <Input className="mt-1" type="number" min="0" max="100" step="0.1" value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button type="submit">{editing ? "Update" : "Create"}</Button>
                        {editing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {currentList.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">{activeTab === "category" ? "Categories" : activeTab === "tax" ? "All Taxes" : "All Units"}</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Name</th>
                            {activeTab === "category" && <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Color</th>}
                            {activeTab === "tax" && <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Rate (%)</th>}
                            <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentList.map((item: any) => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                              <td className="p-3 font-medium">{item.name}</td>
                              {activeTab === "category" && (
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-muted-foreground">{item.color}</span>
                                  </div>
                                </td>
                              )}
                              {activeTab === "tax" && <td className="p-3">{item.rate}%</td>}
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
