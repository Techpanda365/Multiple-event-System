'use client';

import { useState, useEffect } from 'react';
import {
  Search, ChevronUp, ChevronDown, Filter,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft,
  CheckCircle, Clock, AlertCircle,
  Calendar, DollarSign, Loader2, Hash, Landmark
} from 'lucide-react';

interface TxRaw {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  reference: string | null;
  amount: number;
  type: string;
  status: string;
  reconciled: boolean;
  category: string | null;
  bankAccount: { id: string; name: string; accountNumber: string | null };
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

export default function BankTransactionsPage() {
  const [txns, setTxns] = useState<TxRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/bank-transactions');
      if (res.ok) setTxns(await res.json());
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await fetchAll(); })();
  }, []);

  const toggleReconciled = async (id: string, current: boolean) => {
    setReconcilingId(id);
    try {
      const res = await fetch(`/api/accounting/bank-transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reconciled: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTxns(prev => prev.map(t => (t.id === id ? { ...t, reconciled: updated.reconciled } : t)));
      }
    } catch (err) {
      console.error('Reconcile error:', err);
    } finally {
      setReconcilingId(null);
    }
  };

  const enhanced = txns.map(t => ({
    ...t,
    bankName: t.bankAccount?.name || '—',
    accountLabel: t.bankAccount ? `${t.bankAccount.name}${t.bankAccount.accountNumber ? ` (${t.bankAccount.accountNumber})` : ''}` : '—',
  }));

  const filtered = enhanced.filter(t => {
    const q = searchTerm.toLowerCase();
    return t.bankName.toLowerCase().includes(q) || (t.reference || '').toLowerCase().includes(q)
      || t.description.toLowerCase().includes(q) || t.accountLabel.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const sorted = [...currentItems].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDirection === 'asc' ? 1 : -1;
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (sortField) {
      case 'date': aVal = a.date; bVal = b.date; break;
      case 'bankAccount': aVal = a.accountLabel; bVal = b.accountLabel; break;
      case 'reference': aVal = a.reference || ''; bVal = b.reference || ''; break;
      case 'type': aVal = a.type; bVal = b.type; break;
      case 'amount': aVal = a.amount; bVal = b.amount; break;
      case 'balance': aVal = 0; bVal = 0; break;
      case 'status': aVal = a.status; bVal = b.status; break;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

  const badge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'cleared' || s === 'completed') return 'bg-green-900/50 text-green-400 border border-green-800';
    if (s === 'pending') return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
    return 'bg-red-900/50 text-red-400 border border-red-800';
  };

  const statusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'cleared' || s === 'completed') return <CheckCircle className="w-3 h-3" />;
    if (s === 'pending') return <Clock className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const reconciledCount = txns.filter(t => t.reconciled).length;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span>
        <span>Accounting</span><span className="text-gray-600">/</span>
        <span>Banking</span><span className="text-gray-600">/</span>
        <span className="text-white">Bank Transactions</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Bank Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all bank transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
            <div className="text-sm text-gray-400">
              Reconciled: <span className="text-green-400 font-medium">{reconciledCount}</span>
            </div>
            <div className="w-px h-6 bg-gray-700" />
            <div className="text-sm text-gray-400">
              Total: <span className="text-white font-medium">{txns.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <button className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('bankAccount')}>
                  <div className="flex items-center gap-1">Bank Account <SortIcon field="bankAccount" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('reference')}>
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Reference <SortIcon field="reference" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                  Type <SortIcon field="type" sortField={sortField} sortDirection={sortDirection} />
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> Amount <SortIcon field="amount" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1">Balance <SortIcon field="balance" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" sortField={sortField} sortDirection={sortDirection} />
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Mark as Reconciled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No transactions found</td></tr>
              ) : (
                sorted.map((t) => (
                  <tr key={t.id} className={`hover:bg-gray-700/50 transition ${t.reconciled ? 'bg-green-900/5' : ''}`}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-white">{t.accountLabel}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-400 font-mono">{t.reference || '—'}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      {t.type === 'CREDIT' || t.type === 'Credit' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-900/50 text-green-400 border border-green-800">
                          <ArrowUpRight className="w-3 h-3" /> Credit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-900/50 text-red-400 border border-red-800">
                          <ArrowDownLeft className="w-3 h-3" /> Debit
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                      <span className={t.type === 'CREDIT' || t.type === 'Credit' ? 'text-green-400' : 'text-red-400'}>
                        {fmt(t.amount)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-400">—</td>
                    <td className="px-3 py-4">
                      <p className="text-sm text-gray-400 truncate max-w-xs" title={t.description}>{t.description}</p>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge(t.status)}`}>
                        {statusIcon(t.status)}{t.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleReconciled(t.id, t.reconciled)}
                        disabled={reconcilingId === t.id}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${t.reconciled ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'text-gray-500 hover:text-gray-400 hover:bg-gray-700/50'}`}
                        title={t.reconciled ? 'Unmark as reconciled' : 'Mark as reconciled'}>
                        {reconcilingId === t.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className={`w-5 h-5 ${t.reconciled ? 'text-green-400' : ''}`} />
                        )}
                      </button>
                      {t.reconciled && <span className="block text-[10px] text-green-400/60 mt-0.5">Reconciled</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} results
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
