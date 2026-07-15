'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Tag,
  Hash,
  CreditCard,
  FileText,
  Save,
  X,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
}

export default function CreateExpenseCategoryPage() {
  const router = useRouter();
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    giAccount: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    const fetchCoa = async () => {
      try {
        const res = await fetch('/api/accounting/chart-of-accounts');
        if (res.ok) setChartOfAccounts(await res.json());
      } catch {
        setError('Failed to load chart of accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchCoa();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Category name is required'); return; }
    if (!formData.code.trim()) { setError('Category code is required'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/accounting/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expenseCategory',
          name: formData.name.trim(),
          attributes: {
            code: formData.code.trim(),
            giAccount: formData.giAccount,
            description: formData.description.trim(),
          },
          isActive: formData.enabled,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create expense category');
      }
      router.push('/dashboard/accounting/setup/expense-categories');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create expense category');
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
        <Link href="/dashboard/accounting/setup/expense-categories">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Expense Categories</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new expense category</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="name" placeholder="Enter Category Name"
                  value={formData.name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="code" placeholder="Enter Category Code"
                  value={formData.code} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Gl Account</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="giAccount" value={formData.giAccount} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select Gl Account</option>
                  {chartOfAccounts.map(coa => (
                    <option key={coa.id} value={coa.id}>
                      {coa.code} - {coa.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea name="description" placeholder="Enter Description"
                  value={formData.description} onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange}
                  className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-300">Enabled</span>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/setup/expense-categories">
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
