'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const METHODS = ['Straight Line', 'Declining Balance', 'Sum of Years Digits', 'Double Declining'];

export default function CreateDepreciationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    assetId: '', assetName: '', method: 'Straight Line',
    usefulLife: '', salvageValue: '', startDate: '', notes: '',
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
    if (!form.usefulLife || parseInt(form.usefulLife) < 1) { setError('Valid useful life is required'); return; }
    if (form.salvageValue === '') { setError('Salvage value is required'); return; }
    if (!form.startDate) { setError('Start date is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/assets/depreciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: form.assetId || null,
          assetName: form.assetName,
          method: form.method,
          usefulLife: form.usefulLife,
          salvageValue: form.salvageValue,
          startDate: form.startDate,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push('/dashboard/assets/depreciation');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Depreciation">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/assets/depreciation')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Depreciation</h1><p className="text-sm text-muted-foreground">Set up depreciation for an asset</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Depreciation Details</CardTitle></CardHeader>
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
              <label className="text-sm font-medium">Depreciation Method <span className="text-destructive">*</span></label>
              <select value={form.method} onChange={(e) => set('method', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Useful Life (Years) <span className="text-destructive">*</span></label>
              <input type="number" min="1" value={form.usefulLife} onChange={(e) => set('usefulLife', e.target.value)}
                placeholder="Enter years"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Salvage Value <span className="text-destructive">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" step="0.01" min="0" value={form.salvageValue} onChange={(e) => set('salvageValue', e.target.value)}
                  placeholder="Enter salvage value"
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start Date <span className="text-destructive">*</span></label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
                placeholder="Enter notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/assets/depreciation')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
