'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Calendar, FileText, Save, X,
  ChevronDown, Loader2, AlertCircle, User
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
}

export default function CreateCreditNotePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    salesReturnId: '',
    totalAmount: '',
    balance: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sales/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(Array.isArray(data) ? data : []);
        }
      } catch {
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.date) { setError('Date is required'); return; }
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0) { setError('Valid total amount is required'); return; }

    setSubmitting(true);
    try {
      const body = { ...formData, balance: formData.balance || formData.totalAmount };
      const res = await fetch('/api/accounting/credit-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create credit note');
      }
      router.push('/dashboard/accounting/credit-note');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create credit note');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accounting/credit-note">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Credit Note</h1>
          <p className="text-sm text-gray-400 mt-1">Record a credit note against a sales return</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Customer</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="customerId" value={formData.customerId} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Total Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input type="number" name="totalAmount" placeholder="0.00" value={formData.totalAmount} onChange={handleChange}
                  step="0.01" min="0"
                  className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input type="number" name="balance" placeholder="0.00" value={formData.balance} onChange={handleChange}
                  step="0.01" min="0"
                  className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea name="notes" placeholder="Enter notes" value={formData.notes} onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/credit-note">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </Link>
              <button type="submit" disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
