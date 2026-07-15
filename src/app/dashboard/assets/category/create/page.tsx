'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/assets/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push('/dashboard/assets/category');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Category">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/assets/category')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Category</h1><p className="text-sm text-muted-foreground">Add a new asset category</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Category Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/assets/category')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
