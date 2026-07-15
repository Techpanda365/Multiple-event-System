// app/dashboard/assets/borrow-rent/report/page.tsx
'use client';

import { useState } from 'react';
import { 
  Search,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const reportData = {
  totalBorrows: 8,
  totalRevenue: 941.50,
  activeBorrows: 2,
  overdueReturns: 0,
  statusDistribution: [
    { label: 'Returned', value: 4, color: 'bg-green-500' },
    { label: 'Approved', value: 2, color: 'bg-blue-500' },
    { label: 'Draft', value: 2, color: 'bg-gray-500' },
  ],
  paymentStatus: [
    { label: 'Paid', value: 3, color: 'bg-green-500' },
    { label: 'Draft', value: 3, color: 'bg-yellow-500' },
  ],
  mostBorrowedAssets: [
    { name: 'Dell Latitude 5520 Laptop', count: 5 },
    { name: 'HP ProDesk Desktop', count: 4 },
    { name: 'Executive Office Desk', count: 3 },
    { name: 'Toyota Camry 2024', count: 3 },
    { name: 'Industrial Printer MX-5000', count: 2 },
  ],
  topBorrowers: [
    { name: 'John Smith', count: 4 },
    { name: 'Sarah Johnson', count: 3 },
    { name: 'Michael Brown', count: 3 },
    { name: 'Emily Davis', count: 2 },
    { name: 'David Wilson', count: 2 },
  ],
  monthlyTrend: [
    { month: 'Jan', borrows: 2, returns: 1 },
    { month: 'Feb', borrows: 3, returns: 2 },
    { month: 'Mar', borrows: 5, returns: 3 },
    { month: 'Apr', borrows: 4, returns: 4 },
    { month: 'May', borrows: 6, returns: 5 },
    { month: 'Jun', borrows: 8, returns: 6 },
  ]
};

export default function BorrowRentReportPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const maxStatusValue = Math.max(...reportData.statusDistribution.map(d => d.value));
  const maxPaymentValue = Math.max(...reportData.paymentStatus.map(d => d.value));
  const maxAssetCount = Math.max(...reportData.mostBorrowedAssets.map(d => d.count));
  const maxBorrowerCount = Math.max(...reportData.topBorrowers.map(d => d.count));
  const maxMonthlyValue = Math.max(
    ...reportData.monthlyTrend.map(d => Math.max(d.borrows, d.returns))
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Assets</span>
        <span className="text-gray-600">/</span>
        <span>Borrow & Rent</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Report</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Asset Borrow & Rent Report</h1>
          <p className="text-sm text-gray-400 mt-1">View borrow and rent analytics</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Date Range</span>
            <select 
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Apply
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
            Reset
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Borrows</p>
              <p className="text-2xl font-bold text-white">{reportData.totalBorrows}</p>
              <p className="text-xs text-gray-500">All time borrows</p>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(reportData.totalRevenue)}</p>
              <p className="text-xs text-gray-500">Payment received</p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Borrows</p>
              <p className="text-2xl font-bold text-yellow-400">{reportData.activeBorrows}</p>
              <p className="text-xs text-gray-500">Currently approved</p>
            </div>
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Overdue Returns</p>
              <p className={`text-2xl font-bold ${reportData.overdueReturns > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {reportData.overdueReturns}
              </p>
              <p className="text-xs text-gray-500">Need attention</p>
            </div>
            <div className={`p-3 rounded-lg ${reportData.overdueReturns > 0 ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
              {reportData.overdueReturns > 0 ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Status Distribution</h2>
          <div className="space-y-3">
            {reportData.statusDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${item.color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${(item.value / maxStatusValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Payment Status</h2>
          <div className="space-y-3">
            {reportData.paymentStatus.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${item.color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${(item.value / maxPaymentValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Monthly Trend</h2>
        <div className="h-64">
          <div className="flex items-end justify-between h-full gap-1">
            {reportData.monthlyTrend.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="flex gap-0.5 w-full justify-center">
                  <div 
                    className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80"
                    style={{ 
                      height: `${(data.borrows / maxMonthlyValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <div 
                    className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80"
                    style={{ 
                      height: `${(data.returns / maxMonthlyValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-gray-400">Borrows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-xs text-gray-400">Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Assets */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Most Borrowed Assets</h2>
          <div className="space-y-3">
            {reportData.mostBorrowedAssets.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${(item.count / maxAssetCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Borrowers */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Top Borrowers</h2>
          <div className="space-y-3">
            {reportData.topBorrowers.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${(item.count / maxBorrowerCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}