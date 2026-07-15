// app/dashboard/accounting/ledger/profit-loss/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  X,
  Loader2,
  BookOpen,
  Scale,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface PnLItem { code: string; name: string; amount: number; }

interface PnLData { revenue: PnLItem[]; expenses: PnLItem[]; }

export default function ProfitLossPage() {
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/accounting/profit-loss')
      .then(res => res.json())
      .then(d => { if (d && Array.isArray(d.revenue)) setData(d); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalRevenue = data?.revenue.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpenses = data?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/accounting/profit-loss', { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        if (d && Array.isArray(d.revenue)) setData(d);
      }
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Double Entry</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Profit & Loss</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Profit & Loss Statement</h1>
          <p className="text-sm text-gray-400 mt-1">View profit and loss statement</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-400">Loading profit & loss...</p>
          </div>
        </div>
      ) : (
      <>

      {/* Date Range & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Date Range */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Expenses</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className={`bg-gray-800 rounded-lg border ${netProfit >= 0 ? 'border-green-700' : 'border-red-700'} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Net Profit</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {profitMargin >= 0 ? '+' : ''}{profitMargin.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                {netProfit >= 0 ? (
                  <ArrowUp className="w-6 h-6 text-green-400" />
                ) : (
                  <ArrowDown className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Expenses Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenue
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {data?.revenue.map((item, index) => (
              <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                <span className="text-sm text-gray-300">
                  {item.code} - {item.name}
                </span>
                <span className="text-sm font-medium text-green-400">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total Revenue</span>
              <span className="text-sm font-bold text-green-400">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Expenses
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {data?.expenses.map((item, index) => (
              <div key={index} className="px-6 py-3 flex justify-between items-center hover:bg-gray-700/30">
                <span className="text-sm text-gray-300">
                  {item.code} - {item.name}
                </span>
                <span className="text-sm font-medium text-red-400">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="px-6 py-3 bg-gray-900/50 border-t-2 border-gray-700 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total Expenses</span>
              <span className="text-sm font-bold text-red-400">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`bg-gray-800 rounded-lg border ${netProfit >= 0 ? 'border-green-700' : 'border-red-700'} p-4 text-center`}>
          <p className="text-sm text-gray-400">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Profit Summary Bar */}
      <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Profit Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 rounded-full h-3 transition-all"
                  style={{ width: `${(totalRevenue / (totalRevenue + totalExpenses)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Expenses</span>
                <span className="text-red-400">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-500 rounded-full h-3 transition-all"
                  style={{ width: `${(totalExpenses / (totalRevenue + totalExpenses)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Net Profit</span>
                <span className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`${netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full h-3 transition-all`}
                  style={{ 
                    width: `${Math.min(Math.abs(netProfit) / (totalRevenue + totalExpenses) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

    </div>
  );
}