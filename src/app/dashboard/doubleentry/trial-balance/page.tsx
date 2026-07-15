// app/dashboard/accounting/ledger/trial-balance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  FileText,
  Download,
  Printer,
  Calendar,
  Hash,
  BookOpen,
  DollarSign,
  Scale,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  CreditCard,
  Users,
  Tag, 
} from 'lucide-react';
import Link from 'next/link';

interface TrialBalanceItem {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
}

export default function TrialBalancePage() {
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetch('/api/doubleentry/trial-balance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTrialBalanceData(data);
        else if (data.items) setTrialBalanceData(data.items);
      })
      .catch(() => setTrialBalanceData([]));
  }, []);

  const filteredData = trialBalanceData.filter(item =>
    item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.accountCode.includes(searchTerm) ||
    item.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const totalDebit = trialBalanceData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = trialBalanceData.reduce((sum, item) => sum + item.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Asset': 'bg-blue-900/50 text-blue-400 border border-blue-800',
      'Liability': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
      'Equity': 'bg-purple-900/50 text-purple-400 border border-purple-800',
      'Revenue': 'bg-green-900/50 text-green-400 border border-green-800',
      'Expense': 'bg-red-900/50 text-red-400 border border-red-800',
    };
    return colors[type] || 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Asset': return <Building2 className="w-3 h-3" />;
      case 'Liability': return <CreditCard className="w-3 h-3" />;
      case 'Equity': return <Users className="w-3 h-3" />;
      case 'Revenue': return <TrendingUp className="w-3 h-3" />;
      case 'Expense': return <TrendingDown className="w-3 h-3" />;
      default: return <Tag className="w-3 h-3" />;
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Double Entry</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Trial Balance</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trial Balance</h1>
          <p className="text-sm text-gray-400 mt-1">View trial balance report with debits and credits</p>
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

      {/* As of Date & Filters */}
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

      {/* Balance Check Card */}
      <div className={`bg-gray-800 rounded-lg border ${isBalanced ? 'border-green-700' : 'border-red-700'} p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <p className="text-sm text-gray-400">Trial Balance Status</p>
              <p className={`text-lg font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Debit = Total Credit</p>
            <p className="text-sm text-white">
              {formatCurrency(totalDebit)} = {formatCurrency(totalCredit)}
            </p>
            {!isBalanced && (
              <p className="text-sm text-red-400">
                Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total Debit</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totalDebit)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total Credit</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(totalCredit)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total Accounts</p>
          <p className="text-lg font-bold text-white">{trialBalanceData.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('accountCode')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Code <SortIcon field="accountCode" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('accountName')}>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Account Name <SortIcon field="accountName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('accountType')}>
                  Type <SortIcon field="accountType" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('debit')}>
                  <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Debit <SortIcon field="debit" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('credit')}>
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Credit <SortIcon field="credit" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-blue-400">{item.accountCode}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-white">{item.accountName}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getTypeColor(item.accountType)}`}>
                      {getTypeIcon(item.accountType)}
                      {item.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">
                    {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">
                    {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-gray-900 border-t-2 border-gray-700">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap" colSpan={3}>
                  <span className="text-sm font-bold text-white">Total</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-red-400">
                  {formatCurrency(totalDebit)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-green-400">
                  {formatCurrency(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} accounts
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}