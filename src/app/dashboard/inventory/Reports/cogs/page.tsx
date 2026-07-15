// app/dashboard/inventory/Reports/cogs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Search,
  Filter
} from 'lucide-react';

interface CogsTransaction {
  date: string;
  product: string;
  quantity: number;
  unitCost: number;
  totalCOGS: number;
  type: string;
}

export default function COGSReportPage() {
  const [dateRange, setDateRange] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cogsData, setCogsData] = useState<{
    totalCOGS: number;
    totalQuantitySold: number;
    avgUnitCost: number;
    monthlyTrend: { month: string; value: number }[];
    topItems: { name: string; cogs: number }[];
    transactions: CogsTransaction[];
  }>({ totalCOGS: 0, totalQuantitySold: 0, avgUnitCost: 0, monthlyTrend: [], topItems: [], transactions: [] });

  useEffect(() => {
    fetch('/api/inventory/reports/cogs')
      .then(res => res.json())
      .then(data => setCogsData(data))
      .catch(() => setCogsData({ totalCOGS: 0, totalQuantitySold: 0, avgUnitCost: 0, monthlyTrend: [], topItems: [], transactions: [] }));
  }, []);

  const maxValue = Math.max(...cogsData.monthlyTrend.map(d => d.value));

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Manage COGS Report</h1>
        <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Select date range"
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Apply
            </button>
            <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total COGS</p>
              <p className="text-2xl font-bold text-white">${cogsData.totalCOGS.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Quantity Sold</p>
              <p className="text-2xl font-bold text-white">{cogsData.totalQuantitySold.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <Package className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Unit Cost</p>
              <p className="text-2xl font-bold text-white">${cogsData.avgUnitCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly COGS Trend */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Monthly COGS Trend</h2>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-1">
              {cogsData.monthlyTrend.map((data, i) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                    style={{ 
                      height: `${(data.value / maxValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-[10px] text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Items by COGS */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Top 10 Items by COGS</h2>
          <div className="space-y-3">
            {cogsData.topItems.map((item, i) => {
              const maxCogs = cogsData.topItems[0].cogs;
              const percentage = (item.cogs / maxCogs) * 100;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="text-white font-medium">${item.cogs.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`rounded-full h-1.5 transition-all ${
                          i === 0 ? 'bg-blue-500' : 
                          i < 3 ? 'bg-blue-400' : 
                          i < 6 ? 'bg-blue-300' : 'bg-blue-200/50'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent COGS Transactions */}
      <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Recent COGS Transactions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total COGS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {cogsData.transactions.map((item, i) => (
                <tr key={i} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">{item.quantity.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">${item.unitCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 text-right font-medium">${item.totalCOGS.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-400 border border-blue-800">
                      {item.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}