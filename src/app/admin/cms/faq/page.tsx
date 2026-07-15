"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms/faq")
      .then(r => r.json())
      .then(res => { if (Array.isArray(res.content)) setItems(res.content); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/cms/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    setSaving(false);
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), question: "", answer: "" }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: "question" | "answer", value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">FAQ</h2>
            <p className="text-muted-foreground">Manage frequently asked questions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Question</Button>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No FAQ items yet. Click "Add Question" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-2 text-sm font-medium text-muted-foreground">{index + 1}.</div>
                    <div className="flex-1 space-y-3">
                      <Input placeholder="Question" value={item.question} onChange={e => updateItem(item.id, "question", e.target.value)} />
                      <Textarea rows={3} placeholder="Answer" value={item.answer} onChange={e => updateItem(item.id, "answer", e.target.value)} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
