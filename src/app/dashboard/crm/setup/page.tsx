"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

type Section = "pipelines" | "lead-stages" | "deal-stages" | "labels" | "sources";

const sections: { key: Section; label: string }[] = [
  { key: "pipelines", label: "Pipelines" },
  { key: "lead-stages", label: "Lead Stages" },
  { key: "deal-stages", label: "Deal Stages" },
  { key: "labels", label: "Labels" },
  { key: "sources", label: "Sources" },
];

interface Item {
  id: string;
  name: string;
  color?: string | null;
  probability?: number;
  order?: number;
  description?: string | null;
}

function PipelineSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetch("/api/crm/pipelines").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setPipelines(d); }).catch(() => {});
  }, []);
  return (
    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Pipeline</option>
      {pipelines.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
    </select>
  );
}

function SetupTable({ section }: { section: Section }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const apiPath = `/api/crm/${section}`;

  const load = useCallback(async () => {
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiPath]);

  useEffect(() => { load(); }, [load]);

  const fields = (() => {
    switch (section) {
      case "pipelines": return ["name", "description"];
      case "lead-stages": return ["name", "color"];
      case "deal-stages": return ["name", "pipeline", "probability"];
      case "labels": return ["name", "pipeline", "color"];
      case "sources": return ["name"];
    }
  })();

  function emptyForm() {
    const f: Record<string, string> = {};
    fields.forEach((k) => { f[k] = ""; });
    if (section === "deal-stages") { f.pipeline = ""; f.probability = "0"; }
    if (section === "labels") { f.pipeline = ""; f.color = "#6b7280"; }
    if (section === "lead-stages") f.color = "#6b7280";
    return f;
  }

  function startAdd() {
    setAddForm(emptyForm());
    setEditingId(null);
  }

  function startEdit(item: Item) {
    const f: Record<string, string> = {};
    fields.forEach((k) => {
      f[k] = String((item as Record<string, unknown>)[k] ?? "");
    });
    setEditForm(f);
    setEditingId(item.id);
    setAddForm({});
  }

  async function handleCreate() {
    const name = addForm.name?.trim();
    if (!name) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name };
      if (section === "pipelines") body.description = addForm.description?.trim() || null;
      if (section === "lead-stages") body.color = addForm.color?.trim() || null;
      if (section === "deal-stages") { body.pipeline = addForm.pipeline?.trim() || null; body.probability = Number(addForm.probability) || 0; }
      if (section === "labels") { body.pipeline = addForm.pipeline?.trim() || null; body.color = addForm.color?.trim() || "#6b7280"; }
      const res = await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) return;
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setAddForm({});
    } finally { setSaving(false); }
  }

  async function handleUpdate(id: string) {
    const name = editForm.name?.trim();
    if (!name) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name };
      if (section === "pipelines") body.description = editForm.description?.trim() || null;
      if (section === "lead-stages") { body.color = editForm.color?.trim() || null; }
      if (section === "deal-stages") { body.pipeline = editForm.pipeline?.trim() || null; body.probability = Number(editForm.probability) || 0; }
      if (section === "labels") { body.pipeline = editForm.pipeline?.trim() || null; body.color = editForm.color?.trim() || "#6b7280"; }
      const res = await fetch(`${apiPath}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) return;
      const updated = await res.json();
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updated } : i));
      setEditingId(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  }

  function renderField(k: string, value: string, onChange: (v: string) => void) {
    if (k === "color") {
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={value || "#6b7280"} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
          <Input className="w-24 font-mono text-xs" value={value || "#6b7280"} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    }
    if (k === "probability") {
      return (
        <div className="flex items-center gap-1">
          <Input type="number" min={0} max={100} className="w-20" value={value} onChange={(e) => onChange(e.target.value)} />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      );
    }
    if (k === "pipeline") {
      return <PipelineSelect value={value} onChange={onChange} />;
    }
    return <Input placeholder={`Enter ${k}`} value={value} onChange={(e) => onChange(e.target.value)} />;
  }

  if (loading) return <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-3">
      {addForm.name !== undefined && (
        <div className="flex items-end gap-2 p-3 border rounded-lg bg-muted/10">
          {fields.map((k) => (
            <div key={k} className="space-y-1">
              <label className="text-xs text-muted-foreground capitalize">{k}</label>
              {renderField(k, addForm[k] ?? "", (v) => setAddForm((p) => ({ ...p, [k]: v })))}
            </div>
          ))}
          {section === "labels" && addForm.name?.trim() && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Preview</label>
              <div className="h-9 flex items-center px-3 rounded-md text-sm font-medium text-white" style={{ backgroundColor: addForm.color || "#6b7280" }}>
                {addForm.name}
              </div>
            </div>
          )}
          <div className="flex gap-1 pb-0.5">
            <Button size="sm" onClick={handleCreate} disabled={saving || !addForm.name?.trim()}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddForm({})}><X className="h-3 w-3" /></Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b">
              {fields.map((k) => (
                <th key={k} className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">{k}</th>
              ))}
              <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !addForm.name?.trim() && (
              <tr><td colSpan={fields.length + 1} className="text-center py-8 text-muted-foreground text-sm">No items yet</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/5">
                {editingId === item.id ? (
                  <>
                    {fields.map((k) => (
                      <td key={k} className="p-2">
                        {renderField(k, editForm[k] ?? "", (v) => setEditForm((p) => ({ ...p, [k]: v })))}
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleUpdate(item.id)} disabled={saving || !editForm.name?.trim()}>
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-600" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    {fields.map((k) => (
                      <td key={k} className="p-3">
                        {k === "color" && (item as Record<string, unknown>)[k] ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: String((item as Record<string, unknown>)[k]) }} />
                            <span>{String((item as Record<string, unknown>)[k])}</span>
                          </div>
                        ) : k === "pipeline" ? (
                          <Badge variant="outline">{String((item as Record<string, unknown>)[k] ?? "—")}</Badge>
                        ) : k === "probability" ? (
                          <span>{(item as Record<string, unknown>)[k]}%</span>
                        ) : (
                          <span>{String((item as Record<string, unknown>)[k] ?? "")}</span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addForm.name === undefined && (
        <Button variant="outline" size="sm" onClick={startAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add {section === "lead-stages" ? "Lead Stage" : section === "deal-stages" ? "Deal Stage" : section.slice(0, -1)}
        </Button>
      )}
    </div>
  );
}

export default function SystemSetupPage() {
  const [active, setActive] = useState<Section>("pipelines");

  return (
    <DashboardLayout title="System Setup">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Setup</h1>
          <p className="text-sm text-muted-foreground">Manage CRM configuration</p>
        </div>

        <div className="flex border-b border-border">
          {sections.map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${active === s.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {s.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{sections.find((s) => s.key === active)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <SetupTable section={active} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
