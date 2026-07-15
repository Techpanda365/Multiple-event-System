'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreatePaymentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assetName: '',
    customerName: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    status: 'Draft',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.assetName.trim()) { setError('Asset name is required'); return; }
    if (!form.customerName.trim()) { setError('Customer name is required'); return; }
    if (!form.paymentAmount || parseFloat(form.paymentAmount) <= 0) { setError('Valid payment amount is required'); return; }
    if (!form.paymentDate) { setError('Payment date is required'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/assets/borrow-rent/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create'); }
      router.push('/dashboard/assets/borrow-rent/payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Payment">
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Asset Name *</label>
                <input name="assetName" value={form.assetName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Amount ($) *</label>
                <input name="paymentAmount" type="number" step="0.01" value={form.paymentAmount} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Date *</label>
                <input name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
                <input name="referenceNumber" value={form.referenceNumber} onChange={handleChange} placeholder="e.g. PAY-001" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white">
                  <option value="Draft">Draft</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()} className="border-gray-700 text-gray-400">Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? 'Creating...' : 'Create Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
