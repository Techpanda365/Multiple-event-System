// app/dashboard/accounting/ledger/balance-sheet/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  Download,
  Printer,
  Calendar,
  Building2,
  CreditCard,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  X,
  Loader2
} from 'lucide-react';

interface BalanceSheetItem { name: string; amount: number; }

interface BalanceSheetData {
  asOfDate: string;
  assets: {
    currentAssets: BalanceSheetItem[];
    fixedAssets: BalanceSheetItem[];
    otherAssets: BalanceSheetItem[];
  };
  liabilities: {
    currentLiabilities: BalanceSheetItem[];
    longTermLiabilities: BalanceSheetItem[];
  };
  equity: {
    ownersEquity: BalanceSheetItem[];
  };
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch(`/api/accounting/balance-sheet?asOfDate=${asOfDate}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [asOfDate]);

  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    balanceSheetDate: '2026-06-27',
    financialYear: '2026',
  });

  const totalCurrentAssets = data?.assets.currentAssets.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalFixedAssets = data?.assets.fixedAssets.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalOtherAssets = data?.assets.otherAssets.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

  const totalCurrentLiabilities = data?.liabilities.currentLiabilities.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalLongTermLiabilities = data?.liabilities.longTermLiabilities.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalOwnersEquity = data?.equity.ownersEquity.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalEquity = totalOwnersEquity;

  const totalLiabilitiesEquity = totalLiabilities + totalEquity;
  const isBalanced = totalAssets > 0 && totalLiabilitiesEquity > 0 && Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01;

  const handleGenerateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGenerateForm({
      ...generateForm,
      [name]: value
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/accounting/balance-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asOfDate: generateForm.balanceSheetDate }),
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setAsOfDate(generateForm.balanceSheetDate);
      }
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
      setShowGenerateModal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Double Entry</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Balance Sheets</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Balance Sheets</h1>
          <p className="text-sm text-gray-400 mt-1">View balance sheet with assets, liabilities and equity</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Generate Balance Sheet
          </button>
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* As of Date & Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">As of</span>
            <input
              type="date"
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search accounts..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-400">Loading balance sheet...</p>
          </div>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">No balance sheet data available. Add accounts with balances first.</p>
        </div>
      ) : (
      <>
      {/* Balance Check */}
      <div className={`bg-gray-800 rounded-lg border ${isBalanced ? 'border-green-700' : 'border-red-700'} p-4 mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <p className="text-sm text-gray-400">Balance Sheet Status</p>
              <p className={`text-lg font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Assets = Liabilities + Equity</p>
            <p className="text-sm text-white">
              {formatCurrency(totalAssets)} = {formatCurrency(totalLiabilities)} + {formatCurrency(totalEquity)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - ASSETS */}
        <div className="space-y-6">
          {/* Current Assets */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Current Assets
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data?.assets.currentAssets.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-blue-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Current Assets</span>
                <span className="text-sm font-bold text-blue-400">{formatCurrency(totalCurrentAssets)}</span>
              </div>
            </div>
          </div>

          {/* Fixed Assets */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Fixed Assets
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data.assets.fixedAssets.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-purple-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Fixed Assets</span>
                <span className="text-sm font-bold text-purple-400">{formatCurrency(totalFixedAssets)}</span>
              </div>
            </div>
          </div>

          {/* Other Assets */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Other Assets
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data.assets.otherAssets.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-cyan-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Other Assets</span>
                <span className="text-sm font-bold text-cyan-400">{formatCurrency(totalOtherAssets)}</span>
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="bg-gray-800 rounded-lg border border-blue-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-blue-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                Total Assets
              </h2>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-xl font-bold text-blue-400">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - LIABILITIES & EQUITY */}
        <div className="space-y-6">
          {/* Current Liabilities */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                Current Liabilities
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data.liabilities.currentLiabilities.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-yellow-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Current Liabilities</span>
                <span className="text-sm font-bold text-yellow-400">{formatCurrency(totalCurrentLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Long Term Liabilities */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                Long Term Liabilities
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data.liabilities.longTermLiabilities.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-orange-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Long Term Liabilities</span>
                <span className="text-sm font-bold text-orange-400">{formatCurrency(totalLongTermLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Total Liabilities */}
          <div className="bg-gray-800 rounded-lg border border-yellow-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-yellow-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                Total Liabilities
              </h2>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-xl font-bold text-yellow-400">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>

          {/* Equity */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Equity
              </h2>
            </div>
            <div className="divide-y divide-gray-700">
              {data.equity.ownersEquity.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium text-purple-400">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Equity</span>
                <span className="text-sm font-bold text-purple-400">{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Total Liabilities + Equity */}
          <div className={`bg-gray-800 rounded-lg border ${isBalanced ? 'border-green-700' : 'border-red-700'} overflow-hidden`}>
            <div className={`px-6 py-4 bg-gray-900 border-b ${isBalanced ? 'border-green-700' : 'border-red-700'}`}>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${isBalanced ? 'text-green-400' : 'text-red-400'}`} />
                Total Liabilities + Equity
              </h2>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total</span>
              <span className={`text-xl font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalLiabilitiesEquity)}
              </span>
            </div>
            <div className="px-6 py-3 border-t border-gray-700">
              <p className={`text-sm text-center ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                {isBalanced ? '✓ Balance Sheet is balanced' : '✗ Balance Sheet is not balanced'}
              </p>
            </div>
          </div>
        </div>
      </div>

      </>

      )}

      {/* ============ GENERATE BALANCE SHEET MODAL ============ */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Generate Balance Sheet</h2>
                <button 
                  onClick={() => setShowGenerateModal(false)}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Balance Sheet Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Balance Sheet Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="balanceSheetDate"
                      value={generateForm.balanceSheetDate}
                      onChange={handleGenerateChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the date for which you want to generate the balance sheet
                  </p>
                </div>

                {/* Financial Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Financial Year
                  </label>
                  <input
                    type="text"
                    name="financialYear"
                    placeholder="e.g., 2024"
                    value={generateForm.financialYear}
                    onChange={handleGenerateChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the financial year (e.g., 2024)
                  </p>
                </div>

                {/* How it works */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    How it works
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      System will calculate balances for all accounts up to the selected date
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      Accounts will be automatically categorized into Assets, Liabilities, and Equity
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      Balance sheet will be validated to ensure Assets = Liabilities + Equity
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      You can review and finalize the balance sheet after generation
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button 
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}