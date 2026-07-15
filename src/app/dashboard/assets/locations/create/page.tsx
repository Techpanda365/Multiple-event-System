'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const LOCATION_TYPES = ['Select Type', 'Building', 'Warehouse', 'Site', 'Floor', 'Room', 'Office'];

export default function CreateLocationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: '', code: '', type: '', parentLocation: '',
    address: '', city: '', state: '', country: '', postalCode: '',
    contactPerson: '', contactPhone: '', contactEmail: '', description: '',
    isActive: true,
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch('/api/assets/locations').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setLocations(d.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.code.trim()) { setError('Code is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/assets/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: form.type === 'Select Type' ? '' : form.type }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push('/dashboard/assets/locations');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Location">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/assets/locations')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Location</h1><p className="text-sm text-muted-foreground">Add a new location</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Location Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Enter location name"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Code <span className="text-destructive">*</span></label>
              <input type="text" value={form.code} onChange={(e) => set('code', e.target.value)}
                placeholder="Enter location code"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type <span className="text-destructive">*</span></label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parent Location</label>
              <select value={form.parentLocation} onChange={(e) => set('parentLocation', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select parent location</option>
                {locations.filter(l => l.name !== form.name).map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address</label>
              <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
                placeholder="Enter address"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                  placeholder="Enter city"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">State</label>
                <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)}
                  placeholder="Enter state"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country</label>
                <input type="text" value={form.country} onChange={(e) => set('country', e.target.value)}
                  placeholder="Enter country"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Postal Code</label>
                <input type="text" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)}
                  placeholder="Enter postal code"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contact Person</label>
              <input type="text" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)}
                placeholder="Enter contact person"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contact Phone</label>
              <input type="text" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)}
                placeholder="+1234567890"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)}
                placeholder="Enter contact email"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
                placeholder="Enter description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-sm font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/assets/locations')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
