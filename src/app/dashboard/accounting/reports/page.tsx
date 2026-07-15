// app/dashboard/accounting/reports/invoice-aging/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar,
  Download,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  DollarSign,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface AgingItem {
  id: number;
  customer: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90_plus: number;
  total: number;
}

export default function InvoiceAgingReportPage() {
  const [agingData, setAgingData] = useState<AgingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetch('/api/accounting/reports/aging')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAgingData(data);
        else if (data.items) setAgingData(data.items);
      })
      .catch(() => setAgingData([]));
  }, []);

  const totals = useMemo(() => {
    const t = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0, total: 0 };
    agingData.forEach(item => {
      t.current += item.current;
      t.days1_30 += item.days1_30;
      t.days31_60 += item.days31_60;
      t.days61_90 += item.days61_90;
      t.days90_plus += item.days90_plus;
      t.total += item.total;
    });
    return t;
  }, [agingData]);

  const filteredData = agingData.filter(item =>
    item.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Color coding for aging buckets
  const getAgingColor = (days: string, amount: number) => {
    if (amount === 0) return 'text-gray-500';
    if (days === 'current') return 'text-green-400';
    if (days === 'days1_30') return 'text-blue-400';
    if (days === 'days31_60') return 'text-yellow-400';
    if (days === 'days61_90') return 'text-orange-400';
    if (days === 'days90_plus') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Accounting</span>
        <span className="text-gray-600">/</span>
        <span>Reports</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Invoice Aging Report</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoice Aging Report</h1>
          <p className="text-sm text-gray-400 mt-1">View aging of customer invoices</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">As of</span>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <button className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Current</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(totals.current)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">1-30 Days</p>
          <p className="text-lg font-bold text-blue-400">{formatCurrency(totals.days1_30)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">31-60 Days</p>
          <p className="text-lg font-bold text-yellow-400">{formatCurrency(totals.days31_60)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">61-90 Days</p>
          <p className="text-lg font-bold text-orange-400">{formatCurrency(totals.days61_90)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">&gt;90 Days</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totals.days90_plus)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totals.total)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Customer
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Current
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    1-30 Days
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    31-60 Days
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    61-90 Days
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    &gt;90 Days
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-white">{item.customer}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${getAgingColor('current', item.current)}`}>
                    {formatCurrency(item.current)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${getAgingColor('days1_30', item.days1_30)}`}>
                    {formatCurrency(item.days1_30)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${getAgingColor('days31_60', item.days31_60)}`}>
                    {formatCurrency(item.days31_60)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${getAgingColor('days61_90', item.days61_90)}`}>
                    {formatCurrency(item.days61_90)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${getAgingColor('days90_plus', item.days90_plus)}`}>
                    {formatCurrency(item.days90_plus)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-gray-900 border-t-2 border-gray-700">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-white">Total</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-green-400">
                  {formatCurrency(totals.current)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-400">
                  {formatCurrency(totals.days1_30)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-yellow-400">
                  {formatCurrency(totals.days31_60)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-400">
                  {formatCurrency(totals.days61_90)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-red-400">
                  {formatCurrency(totals.days90_plus)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-white">
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} customers
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Aging Summary Visualization */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Bar Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Aging Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'Current', value: totals.current, color: 'bg-green-500', max: totals.total },
              { label: '1-30 Days', value: totals.days1_30, color: 'bg-blue-500', max: totals.total },
              { label: '31-60 Days', value: totals.days31_60, color: 'bg-yellow-500', max: totals.total },
              { label: '61-90 Days', value: totals.days61_90, color: 'bg-orange-500', max: totals.total },
              { label: '>90 Days', value: totals.days90_plus, color: 'bg-red-500', max: totals.total },
            ].map((item) => {
              const percentage = totals.total > 0 ? (item.value / totals.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${item.color} rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Risk Assessment</h2>
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-gray-300">High Risk (&gt;90 Days)</span>
                </div>
                <span className="text-lg font-bold text-red-400">{formatCurrency(totals.days90_plus)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {((totals.days90_plus / totals.total) * 100).toFixed(1)}% of total receivables
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">Medium Risk (31-90 Days)</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{formatCurrency(totals.days31_60 + totals.days61_90)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {((totals.days31_60 + totals.days61_90) / totals.total * 100).toFixed(1)}% of total receivables
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Low Risk (Current & 1-30 Days)</span>
                </div>
                <span className="text-lg font-bold text-green-400">{formatCurrency(totals.current + totals.days1_30)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {((totals.current + totals.days1_30) / totals.total * 100).toFixed(1)}% of total receivables
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}