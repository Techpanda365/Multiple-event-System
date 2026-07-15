'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Save,
  AlertCircle,
  Tag,
  Hash,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface RevenueCategory {
  id: string;
  name: string;
  type: string;
  attributes: {
    code?: string;
    giAccount?: string;
    description?: string;
  };
  isActive: boolean;
}

interface EditFormData {
  id: string;
  name: string;
  code: string;
  giAccount: string;
  description: string;
  isActive: boolean;
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
  return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

export default function RevenueCategoriesPage() {
  const [categories, setCategories] = useState<RevenueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RevenueCategory | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/setup?type=revenueCategory');
      if (res.ok) setCategories(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => { await fetchCategories(); })(); }, []);

  const handleView = (item: RevenueCategory) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item: RevenueCategory) => {
    setSelectedItem(item);
    setEditFormData({
      id: item.id,
      name: item.name,
      code: item.attributes?.code || '',
      giAccount: item.attributes?.giAccount || '',
      description: item.attributes?.description || '',
      isActive: item.isActive,
    });
    setShowEditModal(true);
  };

  const handleDelete = (item: RevenueCategory) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await fetch(`/api/accounting/setup/${selectedItem.id}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== selectedItem.id));
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounting/setup/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          attributes: {
            code: editFormData.code,
            giAccount: editFormData.giAccount,
            description: editFormData.description,
          },
          isActive: editFormData.isActive,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setShowEditModal(false);
      setSelectedItem(null);
      setEditFormData(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData((prev: EditFormData | null) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const filteredItems = categories.filter(item => {
    const q = searchTerm.toLowerCase();
    const attrs = item.attributes || {};
    return (
      item.name.toLowerCase().includes(q) ||
      (attrs.code?.toLowerCase() || '').includes(q) ||
      (attrs.giAccount?.toLowerCase() || '').includes(q)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span>
        <span>Accounting</span><span className="text-gray-600">/</span>
        <span>System Setup</span><span className="text-gray-600">/</span>
        <span className="text-white">Revenue Categories</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Revenue Categories</h1>
          <p className="text-sm text-gray-400 mt-1">Manage revenue categories</p>
        </div>
        <Link href="/dashboard/accounting/setup/revenue-categories/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Revenue Category
          </button>
        </Link>
      </div>

      <div className="flex gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1 mb-6">
        <Link href="/dashboard/accounting/setup">
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md text-sm font-medium transition">Account Types</button>
        </Link>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">Revenue Categories</button>
        <Link href="/dashboard/accounting/setup/expense-categories">
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md text-sm font-medium transition">Expense Categories</button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search revenue categories..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> Category Name <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('code')}>
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Category Code <SortIcon field="code" sortField={sortField} sortDirection={sortDirection} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Gl Account</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('isActive')}>
                  Enabled <SortIcon field="isActive" sortField={sortField} sortDirection={sortDirection} />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No revenue categories found</td></tr>
              ) : (
                currentItems.map((item) => {
                  const attrs = item.attributes || {};
                  return (
                    <tr key={item.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-white">{item.name}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm font-mono text-blue-400">{attrs.code || '—'}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-gray-400">{attrs.giAccount || '—'}</span></td>
                      <td className="px-4 py-4"><span className="text-sm text-gray-400 truncate max-w-xs block">{attrs.description || '—'}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {item.isActive ? (
                          <span className="flex items-center justify-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" /><span className="text-xs">Yes</span></span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-red-400"><XCircle className="w-4 h-4" /><span className="text-xs">No</span></span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(item)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(item)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item)} className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          <button className="text-gray-500 hover:text-gray-400 transition p-1 hover:bg-gray-700/30 rounded"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredItems.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} results</div>
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

      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Revenue Category Details</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedItem(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Category Name</label>
                <p className="text-white text-lg">{selectedItem.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Category Code</label>
                  <p className="text-white font-mono">{selectedItem.attributes?.code || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Gl Account</label>
                  <p className="text-white">{selectedItem.attributes?.giAccount || '—'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <p className="text-gray-300">{selectedItem.attributes?.description || 'No description'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <div className="mt-1">
                  {selectedItem.isActive ? (
                    <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" />Enabled</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400"><XCircle className="w-4 h-4" />Disabled</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowViewModal(false); setSelectedItem(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Revenue Category</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category Code</label>
                <input type="text" name="code" value={editFormData.code} onChange={handleEditChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gl Account</label>
                <input type="text" name="giAccount" value={editFormData.giAccount} onChange={handleEditChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea name="description" value={editFormData.description || ''} onChange={handleEditChange} rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={editFormData.isActive} onChange={handleEditChange}
                    className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-300">Enabled</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-lg"><AlertCircle className="w-6 h-6 text-red-400" /></div>
              <h2 className="text-xl font-semibold text-white">Delete Revenue Category</h2>
            </div>
            <p className="text-gray-400 mb-2">Are you sure you want to delete this revenue category?</p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-sm text-white font-medium">{selectedItem.name}</p>
              <p className="text-sm text-gray-400">Code: {selectedItem.attributes?.code || '—'}</p>
            </div>
            <p className="text-sm text-red-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
