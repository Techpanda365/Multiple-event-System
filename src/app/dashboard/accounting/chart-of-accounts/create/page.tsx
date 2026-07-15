// app/dashboard/accounting/chart-of-accounts/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Hash,
  Tag,
  FileText,
  Save,
  X,
  ChevronDown,
  Layers,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const accountTypes = [
  'Select Account Type',
  'Other Income',
  'Operating Expenses',
  'Cost of Goods Sold',
  'Sales Revenue',
  'Current Assets',
  'Fixed Assets',
  'Current Liabilities',
  'Long Term Liabilities',
  'Equity'
];

export default function CreateChartOfAccountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [parentAccounts, setParentAccounts] = useState<{ id: string; code: string; name: string; type: string }[]>([]);

  useEffect(() => {
    fetch('/api/accounting/chart-of-accounts')
      .then((r) => r.json())
      .then((data) => setParentAccounts(data))
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    accountType: '',
    accountName: '',
    accountCode: '',
    normalBalance: 'Debit',
    openingBalance: '0.00',
    currentBalance: '0.00',
    isActive: true,
    isSubAccount: false,
    parentAccount: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName.trim()) { setError('Account Name is required'); return; }
    if (!formData.accountCode.trim()) { setError('Account Code is required'); return; }
    if (!formData.accountType || formData.accountType === 'Select Account Type') { setError('Account Type is required'); return; }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/accounting/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.accountCode.trim(),
          name: formData.accountName.trim(),
          type: formData.accountType,
          subtype: formData.isSubAccount ? 'sub_account' : null,
          description: formData.description.trim() || null,
          isActive: formData.isActive,
          normalBalance: formData.normalBalance,
          openingBalance: formData.openingBalance,
          currentBalance: formData.currentBalance,
          parentId: formData.isSubAccount ? formData.parentAccount || null : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }

      router.push('/dashboard/accounting/chart-of-accounts');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accounting/chart-of-accounts">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Chart Of Account</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new account to your chart of accounts</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>
      )}

      {/* Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Account Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-800 text-white">
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Account Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="accountName"
                  placeholder="Enter Account Name"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Account Code */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Account Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="accountCode"
                  placeholder="Enter Account Code"
                  value={formData.accountCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Normal Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Normal Balance</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="normalBalance"
                    value="Debit"
                    checked={formData.normalBalance === 'Debit'}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Debit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="normalBalance"
                    value="Credit"
                    checked={formData.normalBalance === 'Credit'}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Credit</span>
                </label>
              </div>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Opening Balance <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  name="openingBalance"
                  placeholder="0.00"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Current Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Current Balance <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  name="currentBalance"
                  placeholder="0.00"
                  value={formData.currentBalance}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Is Active</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSubAccount"
                  checked={formData.isSubAccount}
                  onChange={handleChange}
                  className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Create as sub account</span>
              </label>
            </div>

            {/* Parent Account (shown if sub account is checked) */}
            {formData.isSubAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Parent Account <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="parentAccount"
                    value={formData.parentAccount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Select Parent Account</option>
                    {parentAccounts.map((pa) => (
                      <option key={pa.id} value={pa.id}>{pa.code} - {pa.name} ({pa.type})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/chart-of-accounts">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </Link>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}