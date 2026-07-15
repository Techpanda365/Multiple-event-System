'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TYPES = ['Select type', 'Preventive', 'Corrective', 'Emergency'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    assetId: '', assetName: '',
    type: '', title: '', description: '',
    scheduledDate: '', completedDate: '', cost: '',
    technician: '', status: 'Scheduled', priority: 'Medium',
    nextMaintenance: '', notes: '',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch('/api/assets').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setAssets(d.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
    }).catch(() => {});
  }, []);

  function handleAssetChange(value: string) {
    const asset = assets.find(a => a.id === value);
    set('assetId', value);
    set('assetName', asset?.name || '');
  }

  const handleSubmit = async () => {
    setError('');
    if (!form.assetName) { setError('Please select an asset'); return; }
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.scheduledDate) { setError('Scheduled date is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/assets/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: form.assetId || null,
          assetName: form.assetName,
          type: form.type === 'Select type' ? '' : form.type,
          title: form.title.trim(),
          description: form.description.trim() || null,
          scheduledDate: form.scheduledDate,
          completedDate: form.completedDate || null,
          cost: form.cost || null,
          technician: form.technician.trim() || null,
          status: form.status,
          priority: form.priority,
          nextMaintenance: form.nextMaintenance || null,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push('/dashboard/assets/maintenance');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Maintenance">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/assets/maintenance')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Maintenance</h1><p className="text-sm text-muted-foreground">Schedule maintenance for an asset</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Maintenance Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Asset <span className="text-destructive">*</span></label>
              <select value={form.assetId} onChange={(e) => handleAssetChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select asset</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type <span className="text-destructive">*</span></label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
                placeholder="Enter title"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
                placeholder="Enter description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Scheduled Date <span className="text-destructive">*</span></label>
                <input type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Completed Date</label>
                <input type="date" value={form.completedDate} onChange={(e) => set('completedDate', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" step="0.01" value={form.cost} onChange={(e) => set('cost', e.target.value)}
                    placeholder="Enter cost"
                    className="flex h-9 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Technician Name</label>
                <input type="text" value={form.technician} onChange={(e) => set('technician', e.target.value)}
                  placeholder="Enter technician name"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status <span className="text-destructive">*</span></label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Priority <span className="text-destructive">*</span></label>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Next Maintenance Date</label>
                <input type="date" value={form.nextMaintenance} onChange={(e) => set('nextMaintenance', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  placeholder="Enter notes"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/assets/maintenance')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
