// app/dashboard/inventory/Reports/stock-movement/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar,
  Warehouse,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MovementItem {
  date: string;
  product: string;
  quantity: number;
  type: string;
  reference: string;
}

export default function StockMovementPage() {
  const [dateRange, setDateRange] = useState('');
  const [warehouse, setWarehouse] = useState('All Warehouses');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [movementData, setMovementData] = useState<{
    totalIn: number;
    totalOut: number;
    netMovement: number;
    movementByType: { type: string; value: number; color: string }[];
    monthlyTrend: { month: string; in: number; out: number }[];
    recentMovements: MovementItem[];
  }>({ totalIn: 0, totalOut: 0, netMovement: 0, movementByType: [], monthlyTrend: [], recentMovements: [] });

  useEffect(() => {
    fetch('/api/inventory/reports/stock-movement')
      .then(res => res.json())
      .then(data => setMovementData(data))
      .catch(() => setMovementData({ totalIn: 0, totalOut: 0, netMovement: 0, movementByType: [], monthlyTrend: [], recentMovements: [] }));
  }, []);

  const maxIn = Math.max(...movementData.monthlyTrend.map(d => d.in));
  const maxOut = Math.max(...movementData.monthlyTrend.map(d => d.out));

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMovements = [...movementData.recentMovements];
  if (sortField) {
    sortedMovements.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Manage Stock Movement Report</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters & Stats in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Filters</h2>
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Warehouse</label>
              <div className="relative">
                <Warehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select 
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                >
                  <option value="All Warehouses">All Warehouses</option>
                  <option value="Mid-Atlantic">Mid-Atlantic Warehouse</option>
                  <option value="Mountain">Mountain Region Warehouse</option>
                  <option value="Florida">Florida Fulfillment Center</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-1">
                Apply
              </button>
              <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition flex-1">
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total In</p>
                  <p className="text-xl font-bold text-green-400">${movementData.totalIn.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Out</p>
                  <p className="text-xl font-bold text-red-400">${movementData.totalOut.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <ArrowDown className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Net Movement</p>
                  <p className={`text-xl font-bold ${movementData.netMovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${movementData.netMovement.toFixed(2)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${movementData.netMovement >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  {movementData.netMovement >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Movement by Type */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Movement by Type</h2>
          <div className="space-y-4">
            {movementData.movementByType.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`${item.type.includes('IN') ? 'text-green-400' : 'text-red-400'}`}>
                    {item.type}
                  </span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${item.color} rounded-full h-2 transition-all`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                {item.type.includes('OUT') && (
                  <div className="text-xs text-gray-500 mt-1">
                    Value: ${movementData.totalOut.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Movement Trend */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Monthly Movement Trend</h2>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {movementData.monthlyTrend.map((data, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="flex gap-0.5 w-full justify-center">
                    <div 
                      className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80"
                      style={{ 
                        height: `${(data.in / maxIn) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div 
                      className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80"
                      style={{ 
                        height: `${(data.out / maxOut) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Recent Movements</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search movements..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date <SortIcon field="date" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('product')}>
                  <div className="flex items-center gap-1">Product <SortIcon field="product" /></div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-end gap-1">Quantity <SortIcon field="quantity" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">Type <SortIcon field="type" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('reference')}>
                  <div className="flex items-center gap-1">Reference <SortIcon field="reference" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedMovements
                .filter(item => 
                  item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.reference.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item, i) => (
                  <tr key={i} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">{item.quantity.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'IN' 
                          ? 'bg-green-900/50 text-green-400 border border-green-800' 
                          : 'bg-red-900/50 text-red-400 border border-red-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.reference}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}