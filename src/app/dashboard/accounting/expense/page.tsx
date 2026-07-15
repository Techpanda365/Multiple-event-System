'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2,
  ChevronUp,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Hash,
  DollarSign,
  Landmark,
  Loader2,
  Tag,
  BookOpen,
  XCircle,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  amount: number;
  referenceNumber: string | null;
  description: string | null;
  status: string;
  bankAccount: { id: string; name: string } | null;
  chartOfAccount: { id: string; code: string; name: string } | null;
  approvedBy: { id: string; name: string } | null;
}

interface EditFormData {
  id: string;
  date: string;
  category: string;
  amount: number;
  referenceNumber: string;
  description: string;
  bankAccountId: string;
  chartOfAccountId: string;
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/expense');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchExpenses();
    })();
  }, []);

  const handleView = (r: Expense) => {
    setSelectedExpense(r);
    setShowViewModal(true);
  };

  const handleEdit = (r: Expense) => {
    setSelectedExpense(r);
    setEditFormData({
      id: r.id,
      date: r.date.split('T')[0],
      category: r.category,
      amount: r.amount,
      referenceNumber: r.referenceNumber || '',
      description: r.description || '',
      bankAccountId: r.bankAccount?.id || '',
      chartOfAccountId: r.chartOfAccount?.id || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (r: Expense) => {
    setSelectedExpense(r);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    setDeletingId(selectedExpense.id);
    try {
      await fetch(`/api/accounting/expense/${selectedExpense.id}`, { method: 'DELETE' });
      setExpenses(prev => prev.filter(r => r.id !== selectedExpense.id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedExpense(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/accounting/expense/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExpenses(prev => prev.map(r => (r.id === id ? updated : r)));
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: EditFormData | null) => prev ? { ...prev, [name]: name === 'amount' ? Number(value) : value } : null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounting/expense/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editFormData.date,
          category: editFormData.category,
          amount: editFormData.amount,
          referenceNumber: editFormData.referenceNumber,
          description: editFormData.description,
          bankAccountId: editFormData.bankAccountId,
          chartOfAccountId: editFormData.chartOfAccountId,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExpenses(prev => prev.map(r => (r.id === updated.id ? updated : r)));
        setShowEditModal(false);
        setSelectedExpense(null);
        setEditFormData(null);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const filtered = expenses.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      (r.expenseNumber?.toLowerCase() || '').includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.referenceNumber?.toLowerCase() || '').includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = [...currentItems].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDirection === 'asc' ? 1 : -1;
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (sortField) {
      case 'expenseNumber': aVal = a.expenseNumber || ''; bVal = b.expenseNumber || ''; break;
      case 'category': aVal = a.category; bVal = b.category; break;
      case 'date': aVal = a.date; bVal = b.date; break;
      case 'amount': aVal = a.amount; bVal = b.amount; break;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

  const badge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'posted' || s === 'approved' || s === 'cleared') return 'bg-green-900/50 text-green-400 border border-green-800';
    if (s === 'pending' || s === 'draft') return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
    if (s === 'cancelled') return 'bg-red-900/50 text-red-400 border border-red-800';
    return 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  const statusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'posted' || s === 'approved' || s === 'cleared') return <CheckCircle className="w-3 h-3" />;
    if (s === 'pending' || s === 'draft') return <Clock className="w-3 h-3" />;
    if (s === 'cancelled') return <XCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span>
        <span>Accounting</span><span className="text-gray-600">/</span>
        <span className="text-white">Expenses</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">Track all outgoing expenses</p>
        </div>
        <Link href="/dashboard/accounting/expense/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Create Expense
          </button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search expenses..." className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('expenseNumber')}>
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Expense Number <SortIcon field="expenseNumber" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> Category <SortIcon field="category" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><Landmark className="w-3 h-3" /> Bank Account</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Chart of Account</div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> Amount <SortIcon field="amount" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Reference</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved By</div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500">No expenses found</td></tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm font-mono text-blue-400">{r.expenseNumber || '—'}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{r.category}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{r.bankAccount?.name || '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                      {r.chartOfAccount ? `${r.chartOfAccount.code} - ${r.chartOfAccount.name}` : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-white">{fmt(r.amount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{r.referenceNumber || '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge(r.status)}`}>
                        {statusIcon(r.status)}{r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                      {r.approvedBy?.name || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleView(r)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(r)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleStatusUpdate(r.id, 'Approved')} disabled={updatingId === r.id}
                          className="text-green-400 hover:text-green-300 transition p-1 hover:bg-green-900/20 rounded" title="Approve">
                          {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleStatusUpdate(r.id, 'Cancelled')} disabled={updatingId === r.id}
                          className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Cancel">
                          {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(r)}
                          className="text-gray-400 hover:text-gray-300 transition p-1 hover:bg-gray-700/30 rounded" title="Delete" disabled={deletingId === r.id}>
                          {deletingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Expense Details</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedExpense(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs text-gray-500">Expense Number</label>
                  <p className="text-white font-mono text-lg">{selectedExpense.expenseNumber || '—'}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge(selectedExpense.status)}`}>
                  {statusIcon(selectedExpense.status)}{selectedExpense.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-white">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Category</label>
                  <p className="text-white">{selectedExpense.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Bank Account</label>
                  <p className="text-white">{selectedExpense.bankAccount?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Chart of Account</label>
                  <p className="text-white">{selectedExpense.chartOfAccount ? `${selectedExpense.chartOfAccount.code} - ${selectedExpense.chartOfAccount.name}` : '—'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Amount</label>
                <p className="text-white text-xl font-semibold">{fmt(selectedExpense.amount)}</p>
              </div>
              {selectedExpense.referenceNumber && (
                <div>
                  <label className="text-xs text-gray-500">Reference Number</label>
                  <p className="text-white">{selectedExpense.referenceNumber}</p>
                </div>
              )}
              {selectedExpense.description && (
                <div>
                  <label className="text-xs text-gray-500">Description</label>
                  <p className="text-gray-300">{selectedExpense.description}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowViewModal(false); setSelectedExpense(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Expense</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedExpense(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 font-mono">{selectedExpense?.expenseNumber || ''}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input type="date" name="date" value={editFormData.date} onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <input type="text" name="category" value={editFormData.category} onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} step="0.01"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
                <input type="text" name="referenceNumber" value={editFormData.referenceNumber} onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowEditModal(false); setSelectedExpense(null); setEditFormData(null); }}
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
      {showDeleteModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Expense</h2>
            <p className="text-gray-400 mb-2">Are you sure?</p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-sm text-white font-mono">{selectedExpense.expenseNumber || 'Expense'}</p>
              <p className="text-sm text-gray-400">{selectedExpense.category} — {fmt(selectedExpense.amount)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedExpense(null); }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={confirmDelete} disabled={deletingId === selectedExpense.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                {deletingId === selectedExpense.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
