'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Calendar,
  Tag,
  Hash,
  FileText,
  Save,
  X,
  ChevronDown,
  Landmark,
  Loader2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface BankAccount {
  id: string;
  name: string;
  accountNumber?: string;
}

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
}

export default function CreateExpensePage() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    bankAccountId: '',
    chartOfAccountId: '',
    amount: '',
    referenceNumber: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, coaRes, catRes] = await Promise.all([
          fetch('/api/accounting/bank-accounts'),
          fetch('/api/accounting/chart-of-accounts'),
          fetch('/api/accounting/setup?type=expenseCategory'),
        ]);
        if (bankRes.ok) setBankAccounts(await bankRes.json());
        if (coaRes.ok) setChartOfAccounts(await coaRes.json());
        if (catRes.ok) {
          const cats = await catRes.json();
          setExpenseCategories(cats.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      } catch {
        setError('Failed to load form data');
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

    if (!formData.date) { setError('Expense date is required'); return; }
    if (!formData.category) { setError('Category is required'); return; }
    if (!formData.bankAccountId) { setError('Bank account is required'); return; }
    if (!formData.chartOfAccountId) { setError('Chart of account is required'); return; }
    if (!formData.amount || Number(formData.amount) <= 0) { setError('Valid amount is required'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/accounting/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create expense');
      }
      router.push('/dashboard/accounting/expense');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
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
        <Link href="/dashboard/accounting/expense">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Expense</h1>
          <p className="text-sm text-gray-400 mt-1">Record outgoing expense</p>
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
            {/* Expense Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Expense Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="category" value={formData.category} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select Category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Bank Account <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="bankAccountId" value={formData.bankAccountId} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}{acc.accountNumber ? ` (${acc.accountNumber})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Chart of Account */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Chart of Account <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select name="chartOfAccountId" value={formData.chartOfAccountId} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select Chart of Account</option>
                  {chartOfAccounts.map(coa => (
                    <option key={coa.id} value={coa.id}>
                      {coa.code} - {coa.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input type="number" name="amount" placeholder="0.00" value={formData.amount} onChange={handleChange}
                  step="0.01" min="0"
                  className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="referenceNumber" placeholder="Enter Reference Number"
                  value={formData.referenceNumber} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea name="description" placeholder="Enter Description" value={formData.description} onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/expense">
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
