'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, ChevronUp, ChevronDown, Filter,
  ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle,
  Calendar, DollarSign, Loader2, XCircle,
  Eye, Edit, Save, X, Hash, FileText, Landmark, ArrowRightLeft, Play
} from 'lucide-react';
import Link from 'next/link';

interface AccountInfo { id: string; name: string; accountNumber: string | null; currentBalance: number; }

interface TransferRaw {
  id: string;
  transferNumber: string;
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  charges: number;
  reference: string | null;
  description: string | null;
  status: string;
  fromAccount: AccountInfo;
  toAccount: AccountInfo;
}

interface EditFormData {
  id: string;
  date: string;
  amount: number;
  charges: number;
  reference: string;
  description: string;
  status: string;
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransferRaw | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/bank-transfers');
      if (res.ok) setTransfers(await res.json());
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await fetchAll(); })();
  }, []);

  const handleView = (t: TransferRaw) => { setSelectedTx(t); setShowViewModal(true); };
  const handleEdit = (t: TransferRaw) => {
    setSelectedTx(t);
    setEditFormData({ id: t.id, date: t.date.split('T')[0], amount: t.amount, charges: t.charges, reference: t.reference || '', description: t.description || '', status: t.status });
    setShowEditModal(true);
  };
  const handleDelete = (t: TransferRaw) => { setSelectedTx(t); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!selectedTx) return;
    setDeletingId(selectedTx.id);
    try {
      await fetch(`/api/accounting/bank-transfers/${selectedTx.id}`, { method: 'DELETE' });
      setTransfers(prev => prev.filter(t => t.id !== selectedTx.id));
    } catch (err) { console.error('Delete error:', err); }
    finally { setDeletingId(null); setShowDeleteModal(false); setSelectedTx(null); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/accounting/bank-transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransfers(prev => prev.map(t => (t.id === id ? { ...t, status: updated.status } : t)));
      }
    } catch (err) { console.error('Status update error:', err); }
    finally { setDeletingId(null); }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: EditFormData | null) => prev
      ? { ...prev, [name]: name === 'amount' || name === 'charges' ? Number(value) : value }
      : null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounting/bank-transfers/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransfers(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        setShowEditModal(false); setSelectedTx(null); setEditFormData(null);
      }
    } catch (err) { console.error('Save edit error:', err); }
    finally { setSaving(false); }
  };

  const enhanced = transfers.map(t => ({
    ...t,
    fromName: t.fromAccount?.name || '—',
    fromNumber: t.fromAccount?.accountNumber || '',
    toName: t.toAccount?.name || '—',
    toNumber: t.toAccount?.accountNumber || '',
    fromBalance: t.fromAccount?.currentBalance || 0,
    toBalance: t.toAccount?.currentBalance || 0,
  }));

  const filtered = enhanced.filter(t => {
    const q = searchTerm.toLowerCase();
    return t.fromName.toLowerCase().includes(q) || t.toName.toLowerCase().includes(q)
      || (t.reference || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
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
      case 'transferNumber': aVal = a.transferNumber || ''; bVal = b.transferNumber || ''; break;
      case 'from': aVal = a.fromName; bVal = b.fromName; break;
      case 'to': aVal = a.toName; bVal = b.toName; break;
      case 'amount': aVal = a.amount; bVal = b.amount; break;
      case 'status': aVal = a.status; bVal = b.status; break;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

  const badge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-green-900/50 text-green-400 border border-green-800';
    if (s === 'pending') return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
    if (s === 'failed' || s === 'cancelled') return 'bg-red-900/50 text-red-400 border border-red-800';
    return 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  const statusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return <CheckCircle className="w-3 h-3" />;
    if (s === 'pending') return <Clock className="w-3 h-3" />;
    if (s === 'failed' || s === 'cancelled') return <XCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span>
        <span>Accounting</span><span className="text-gray-600">/</span>
        <span>Banking</span><span className="text-gray-600">/</span>
        <span className="text-white">Bank Transfers</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Bank Transfers</h1>
          <p className="text-sm text-gray-400 mt-1">Manage transfers between bank accounts</p>
        </div>
        <Link href="/dashboard/accounting/banking/transfers/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> New Transfer
          </button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search transfers..." className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('transferNumber')}>
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Transfer # <SortIcon field="transferNumber" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('from')}>
                  <div className="flex items-center gap-1"><Landmark className="w-3 h-3" /> From Account <SortIcon field="from" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <ArrowRightLeft className="w-3 h-3 inline" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('to')}>
                  <div className="flex items-center gap-1"><Landmark className="w-3 h-3" /> To Account <SortIcon field="to" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Reference</div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> Amount <SortIcon field="amount" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" sortField={sortField} sortDirection={sortDirection} />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No transfers found</td></tr>
              ) : (
                sorted.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-400">{t.transferNumber || '—'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="text-sm text-white">{t.fromName}</div>
                          {t.fromNumber && <div className="text-xs text-gray-500">{t.fromNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><ArrowRightLeft className="w-4 h-4 text-blue-400" /></td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-sm text-white">{t.toName}</div>
                          {t.toNumber && <div className="text-xs text-gray-500">{t.toNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{t.reference || '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-white">{fmt(t.amount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge(t.status)}`}>
                        {statusIcon(t.status)}{t.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleView(t)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(t)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        {t.status !== 'Completed' && (
                          <button onClick={() => handleStatusUpdate(t.id, 'Completed')} disabled={deletingId === t.id}
                            className="text-green-400 hover:text-green-300 transition p-1 hover:bg-green-900/20 rounded" title="Execute Transfer">
                            {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => handleDelete(t)}
                          className="text-gray-400 hover:text-gray-300 transition p-1 hover:bg-gray-700/30 rounded" title="Delete" disabled={deletingId === t.id}>
                          {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} results</div>
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

      {/* View Modal */}
      {showViewModal && selectedTx && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Transfer Details</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedTx(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-white">{new Date(selectedTx.date).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge(selectedTx.status)}`}>
                  {statusIcon(selectedTx.status)}{selectedTx.status}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500">From Account</label>
                <p className="text-white">{selectedTx.fromAccount?.name || '—'}</p>
                {selectedTx.fromAccount?.accountNumber && <p className="text-xs text-gray-500">{selectedTx.fromAccount.accountNumber}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500">To Account</label>
                <p className="text-white">{selectedTx.toAccount?.name || '—'}</p>
                {selectedTx.toAccount?.accountNumber && <p className="text-xs text-gray-500">{selectedTx.toAccount.accountNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <p className="text-white text-lg font-semibold">{fmt(selectedTx.amount)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Charges</label>
                  <p className="text-white">{fmt(selectedTx.charges || 0)}</p>
                </div>
              </div>
              {selectedTx.reference && (
                <div>
                  <label className="text-xs text-gray-500">Reference</label>
                  <p className="text-white font-mono">{selectedTx.reference}</p>
                </div>
              )}
              {selectedTx.description && (
                <div>
                  <label className="text-xs text-gray-500">Description</label>
                  <p className="text-gray-300">{selectedTx.description}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowViewModal(false); setSelectedTx(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Transfer</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedTx(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input type="date" name="date" value={editFormData.date} onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                  <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} step="0.01"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Charges</label>
                  <input type="number" name="charges" value={editFormData.charges} onChange={handleEditChange} step="0.01"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
                <input type="text" name="reference" value={editFormData.reference} onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select name="status" value={editFormData.status} onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowEditModal(false); setSelectedTx(null); setEditFormData(null); }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTx && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Transfer</h2>
            <p className="text-gray-400 mb-2">Are you sure?</p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-sm text-white">{selectedTx.fromAccount?.name || 'From'} → {selectedTx.toAccount?.name || 'To'}</p>
              <p className="text-sm text-gray-400">{fmt(selectedTx.amount)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedTx(null); }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={confirmDelete} disabled={deletingId === selectedTx.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                {deletingId === selectedTx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
