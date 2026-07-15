'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Calendar, FileText, Save, X,
  ChevronDown, Loader2, AlertCircle, Landmark, Hash, DollarSign, ArrowRightLeft
} from 'lucide-react';
import Link from 'next/link';

interface BankAccount { id: string; name: string; accountNumber: string | null; currentBalance: number; }

export default function CreateBankTransferPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    charges: '0',
    reference: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/accounting/bank-accounts');
        if (res.ok) setAccounts(await res.json());
      } catch {
        setError('Failed to load bank accounts');
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

    if (!formData.fromAccountId) { setError('From account is required'); return; }
    if (!formData.toAccountId) { setError('To account is required'); return; }
    if (formData.fromAccountId === formData.toAccountId) { setError('From and To accounts must be different'); return; }
    if (!formData.date) { setError('Date is required'); return; }
    if (!formData.description?.trim()) { setError('Description is required'); return; }
    if (!formData.amount || Number(formData.amount) <= 0) { setError('Valid amount is required'); return; }

    setSubmitting(true);
    try {
      const body = {
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        date: formData.date,
        amount: Number(formData.amount),
        charges: Number(formData.charges) || 0,
        reference: formData.reference?.trim() || null,
        description: formData.description.trim(),
      };
      const res = await fetch('/api/accounting/bank-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create transfer');
      }
      router.push('/dashboard/accounting/banking/transfers');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

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
        <Link href="/dashboard/accounting/banking/transfers">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Bank Transfer</h1>
          <p className="text-sm text-gray-400 mt-1">Transfer funds between bank accounts</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Transfer Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">From Account <span className="text-red-400">*</span></label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="fromAccountId" value={formData.fromAccountId} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select source account</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} {a.accountNumber ? `(${a.accountNumber})` : ''}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {fromAccount && (
                <p className="mt-1 text-sm text-gray-500">Balance: <span className="text-white">${fromAccount.currentBalance.toLocaleString()}</span></p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">To Account <span className="text-red-400">*</span></label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="toAccountId" value={formData.toAccountId} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select destination account</option>
                  {accounts.filter(a => a.id !== formData.fromAccountId).map(a => (
                    <option key={a.id} value={a.id}>{a.name} {a.accountNumber ? `(${a.accountNumber})` : ''}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {toAccount && (
                <p className="mt-1 text-sm text-gray-500">Balance: <span className="text-white">${toAccount.currentBalance.toLocaleString()}</span></p>
              )}
            </div>

            {formData.fromAccountId && formData.toAccountId && (
              <div className="flex items-center justify-center gap-3 text-gray-400 bg-gray-900/50 rounded-lg p-3">
                <span className="text-sm">{fromAccount?.name}</span>
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <span className="text-sm">{toAccount?.name}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Transfer Amount <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" name="amount" placeholder="0.00" value={formData.amount} onChange={handleChange}
                    step="0.01" min="0"
                    className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Transfer Charges</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" name="charges" placeholder="0" value={formData.charges} onChange={handleChange}
                    step="0.01" min="0"
                    className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="reference" placeholder="Optional reference number" value={formData.reference} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description <span className="text-red-400">*</span></label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea name="description" placeholder="Enter description" value={formData.description} onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/banking/transfers">
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
