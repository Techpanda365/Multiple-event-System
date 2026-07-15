// app/dashboard/accounting/ledger/summary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
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
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';

interface LedgerEntry {
  id: number;
  date: string;
  accountCode: string;
  accountName: string;
  reference: string;
  description: string;
  debit: number | null;
  credit: number | null;
}

export default function LedgerSummaryPage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('/api/accounting/ledger/summary')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLedgerEntries(data); })
      .catch(() => setLedgerEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries = ledgerEntries.filter(entry =>
    entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.accountCode.includes(searchTerm) ||
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

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
        <span className="text-white">Ledger Summary</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ledger Summary</h1>
          <p className="text-sm text-gray-400 mt-1">View all ledger entries and transactions</p>
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
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search ledger entries..."
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

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('accountCode')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Account Code <SortIcon field="accountCode" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('accountName')}>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Account Name <SortIcon field="accountName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('reference')}>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Reference <SortIcon field="reference" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
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
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : currentEntries.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No ledger entries found</td></tr>
              ) : (
                currentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{entry.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-400">{entry.accountCode}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{entry.accountName}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{entry.reference}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{entry.description}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">
                      {entry.debit ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">
                      {entry.credit ? formatCurrency(entry.credit) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-gray-900 border-t-2 border-gray-700">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap" colSpan={5}>
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEntries.length)} of {filteredEntries.length} results
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