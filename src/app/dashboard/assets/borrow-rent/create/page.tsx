'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateBorrowRentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [assets, setAssets] = useState<{ id: string; name: string; serialNumber: string | null; quantity: number }[]>([]);
  const [form, setForm] = useState({
    staffUserId: '', staffUserName: '', staffUserEmail: '',
    assetId: '', assetName: '', assetCode: '',
    startDate: '', endDate: '', quantity: 1, purpose: '',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/assets').then(r => r.json()),
    ]).then(([usersData, assetsData]) => {
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(assetsData)) setAssets(assetsData);
    }).catch(() => {});
  }, []);

  function handleUserChange(value: string) {
    const user = users.find(u => u.id === value);
    set('staffUserId', value);
    set('staffUserName', user?.name || '');
    set('staffUserEmail', user?.email || '');
  }

  function handleAssetChange(value: string) {
    const asset = assets.find(a => a.id === value);
    set('assetId', value);
    set('assetName', asset?.name || '');
    set('assetCode', asset?.serialNumber || '');
  }

  const handleSubmit = async () => {
    setError('');
    if (!form.staffUserName) { setError('Please select a staff user'); return; }
    if (!form.assetName) { setError('Please select an asset'); return; }
    if (!form.startDate) { setError('Start date is required'); return; }
    if (!form.endDate) { setError('End date is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/assets/borrow-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push('/dashboard/assets/borrow-rent');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Borrow & Rent">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/assets/borrow-rent')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Asset Borrow & Rent</h1><p className="text-sm text-muted-foreground">Create a new borrow or rent record</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Borrow & Rent Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Staff User <span className="text-destructive">*</span></label>
              <select value={form.staffUserId} onChange={(e) => handleUserChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select Staff User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Asset <span className="text-destructive">*</span></label>
              <select value={form.assetId} onChange={(e) => handleAssetChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select Asset</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.serialNumber || 'N/A'}) - Available: {a.quantity}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start Date <span className="text-destructive">*</span></label>
                <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Date <span className="text-destructive">*</span></label>
                <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Quantity <span className="text-destructive">*</span></label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', parseInt(e.target.value) || 1)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Purpose</label>
              <textarea value={form.purpose} onChange={(e) => set('purpose', e.target.value)} rows={3}
                placeholder="Enter Purpose"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/assets/borrow-rent')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
