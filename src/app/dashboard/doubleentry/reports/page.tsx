// app/dashboard/accounting/ledger/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  X,
  Loader2,
  Clock,
  Hash,
  BookOpen,
  Scale,
  Tag,
  ArrowLeftRight,
  Repeat,
  Shield,
  BarChart3,
  PieChart,
  Filter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  Users,
  Building2,
  CreditCard,
  Wallet,
  Receipt,
  Landmark,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import Link from 'next/link';



// ============ TYPES ============
interface JournalEntry {
  id: number;
  journalNumber: string;
  date: string;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
}

interface GeneralLedgerItem {
  id: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AccountStatementItem {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AccountBalanceItem {
  id: number;
  accountCode: string;
  accountName: string;
  balance: number;
  type: string;
}

interface CashFlowItem {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
}

// ============ COMPONENTS ============

// 1. Journal Entry Tab
function JournalEntryTab({ journalEntries }: { journalEntries: JournalEntry[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = journalEntries.filter(entry =>
    entry.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntries = filtered.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Posted': 'bg-green-900/50 text-green-400 border border-green-800',
      'Draft': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
      'Approved': 'bg-blue-900/50 text-blue-400 border border-blue-800',
      'Cancelled': 'bg-red-900/50 text-red-400 border border-red-800',
    };
    return colors[status] || 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search journal entries..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Journal #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total Credit</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{entry.journalNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{entry.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{entry.reference}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{entry.description}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">{formatCurrency(entry.totalDebit)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">{formatCurrency(entry.totalCredit)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} results</div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Previous</button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. General Ledger Tab
function GeneralLedgerTab({ generalLedgerData }: { generalLedgerData: GeneralLedgerItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = generalLedgerData.filter(item =>
    item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.accountCode.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalDebit = filtered.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = filtered.reduce((sum, item) => sum + item.credit, 0);

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search ledger accounts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Credit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{item.accountCode}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{item.accountName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${item.balance >= 0 ? 'text-white' : 'text-orange-400'}`}>
                    {formatCurrency(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900 border-t-2 border-gray-700">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap" colSpan={2}><span className="text-sm font-bold text-white">Total</span></td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-red-400">{formatCurrency(totalDebit)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-green-400">{formatCurrency(totalCredit)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-white">{formatCurrency(totalDebit - totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Account Statement Tab
function AccountStatementTab({ accountStatementData }: { accountStatementData: AccountStatementItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = accountStatementData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search statements..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Credit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{item.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{item.description}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-white">{formatCurrency(item.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. Account Balance Tab
function AccountBalanceTab({ accountBalanceData }: { accountBalanceData: AccountBalanceItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = accountBalanceData.filter(item =>
    item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.accountCode.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getTypeColor = (type: string) => {
    return type === 'Asset' 
      ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
      : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-md">
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

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{item.accountCode}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{item.accountName}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${item.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {formatCurrency(item.balance)}
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

// 5. Cash Flow Tab
function CashFlowTab({ cashFlowData }: { cashFlowData: CashFlowItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = cashFlowData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalInflow = cashFlowData.filter(item => item.type === 'inflow').reduce((sum, item) => sum + item.amount, 0);
  const totalOutflow = cashFlowData.filter(item => item.type === 'outflow').reduce((sum, item) => sum + item.amount, 0);
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total Inflow</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalInflow)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Total Outflow</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalOutflow)}</p>
        </div>
        <div className={`bg-gray-800 rounded-lg border ${netCashFlow >= 0 ? 'border-green-700' : 'border-red-700'} p-4`}>
          <p className="text-xs text-gray-400">Net Cash Flow</p>
          <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(netCashFlow)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search cash flow entries..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{item.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{item.description}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${item.type === 'inflow' ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'inflow' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                      {item.type === 'inflow' ? 'INFLOW' : 'OUTFLOW'}
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

// ============ MAIN REPORTS PAGE ============
export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('journal-entry');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isGenerating, setIsGenerating] = useState(false);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [generalLedgerData, setGeneralLedgerData] = useState<GeneralLedgerItem[]>([]);
  const [accountStatementData, setAccountStatementData] = useState<AccountStatementItem[]>([]);
  const [accountBalanceData, setAccountBalanceData] = useState<AccountBalanceItem[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);

  useEffect(() => {
    fetch('/api/doubleentry/reports')
      .then(res => res.json())
      .then(data => {
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.generalLedger) setGeneralLedgerData(data.generalLedger);
        if (data.accountStatements) setAccountStatementData(data.accountStatements);
        if (data.accountBalances) setAccountBalanceData(data.accountBalances);
        if (data.cashFlows) setCashFlowData(data.cashFlows);
      })
      .catch(() => {
        setJournalEntries([]);
        setGeneralLedgerData([]);
        setAccountStatementData([]);
        setAccountBalanceData([]);
        setCashFlowData([]);
      });
  }, []);

  const reportTypes = [
    { id: 'journal-entry', name: 'Journal Entry', icon: FileText },
    { id: 'general-ledger', name: 'General Ledger', icon: BookOpen },
    { id: 'account-statement', name: 'Account Statement', icon: FileSpreadsheet },
    { id: 'account-balance', name: 'Account Balance', icon: Scale },
    { id: 'cash-flow', name: 'Cash Flow', icon: DollarSign },
  ];

  const statusOptions = ['All Status', 'Posted', 'Draft', 'Approved', 'Cancelled'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const handleClear = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setSelectedStatus('All Status');
  };

  const renderTabContent = () => {
    switch (selectedReport) {
      case 'journal-entry':
        return <JournalEntryTab journalEntries={journalEntries} />;
      case 'general-ledger':
        return <GeneralLedgerTab generalLedgerData={generalLedgerData} />;
      case 'account-statement':
        return <AccountStatementTab accountStatementData={accountStatementData} />;
      case 'account-balance':
        return <AccountBalanceTab accountBalanceData={accountBalanceData} />;
      case 'cash-flow':
        return <CashFlowTab cashFlowData={cashFlowData} />;
      default:
        return <JournalEntryTab journalEntries={journalEntries} />;
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
        <span className="text-white">Reports</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-sm text-gray-400 mt-1">View and generate accounting reports</p>
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

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                selectedReport === report.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {report.name}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <button 
              onClick={handleClear}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}