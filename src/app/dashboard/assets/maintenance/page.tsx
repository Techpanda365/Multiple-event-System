'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, Eye, ChevronUp, ChevronDown, MoreVertical, Filter,
  ChevronLeft, ChevronRight, Calendar, DollarSign, Clock,
  CheckCircle, AlertCircle, XCircle, Download, Tag, Hash, X, Save, Loader2, Settings
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  'Scheduled': 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'In Progress': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  'Completed': 'bg-green-900/50 text-green-400 border border-green-800',
  'Cancelled': 'bg-red-900/50 text-red-400 border border-red-800',
};

const priorityColors: Record<string, string> = {
  'Critical': 'text-red-400 bg-red-900/30 border border-red-800',
  'High': 'text-orange-400 bg-orange-900/30 border border-orange-800',
  'Medium': 'text-yellow-400 bg-yellow-900/30 border border-yellow-800',
  'Low': 'text-green-400 bg-green-900/30 border border-green-800',
};

const typeColors: Record<string, string> = {
  'Preventive': 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'Corrective': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  'Emergency': 'bg-red-900/50 text-red-400 border border-red-800',
};

const statusIcons: Record<string, any> = {
  'Scheduled': Calendar,
  'In Progress': Clock,
  'Completed': CheckCircle,
  'Cancelled': XCircle,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export default function MaintenancePage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets/maintenance');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.technician?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (item: any) => { setSelectedItem(item); setShowViewModal(true); };
  const handleEdit = (item: any) => { setSelectedItem(item); setEditFormData({ ...item }); setShowEditModal(true); };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/maintenance/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) { await fetchItems(); setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }
    } finally { setIsLoading(false); }
  };

  const handleDelete = (item: any) => { setSelectedItem(item); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/maintenance/${selectedItem.id}`, { method: 'DELETE' });
      if (res.ok) { await fetchItems(); setShowDeleteModal(false); setSelectedItem(null); }
    } finally { setIsLoading(false); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span><span>Assets</span><span className="text-gray-600">/</span><span className="text-white">Maintenance</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Maintenance</h1>
          <p className="text-sm text-gray-400 mt-1">Manage asset maintenance records</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/dashboard/assets/maintenance/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> New Maintenance
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search maintenance..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> Title <SortIcon field="title" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('assetName')}>
                  Asset <SortIcon field="assetName" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                  Type <SortIcon field="type" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('scheduledDate')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Scheduled <SortIcon field="scheduledDate" /></div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                  Priority <SortIcon field="priority" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('cost')}>
                  <div className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> Cost <SortIcon field="cost" /></div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No maintenance records found</td></tr>
              ) : pageItems.map((item) => {
                const StatusIcon = statusIcons[item.status] || Clock;
                return (
                  <tr key={item.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-white">{item.title}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-gray-400">{item.assetName}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[item.type] || typeColors['Preventive']}`}>{item.type}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{item.scheduledDate?.split('T')[0]}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[item.status] || statusColors['Scheduled']}`}>
                        <StatusIcon className="w-3 h-3" /> {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[item.priority] || priorityColors['Medium']}`}>{item.priority}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-yellow-400">{formatCurrency(item.cost || 0)}</td>
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
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} results
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Next</button>
          </div>
        </div>
      </div>

      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Maintenance Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedItem(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div><h3 className="text-lg font-medium text-white">{selectedItem.title}</h3><p className="text-sm text-gray-400">{selectedItem.assetName}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Type</label><span className={`px-2 py-1 text-xs rounded-full ml-2 ${typeColors[selectedItem.type] || typeColors['Preventive']}`}>{selectedItem.type}</span></div>
                  <div><label className="text-xs text-gray-500">Priority</label><span className={`px-2 py-1 text-xs rounded-full ml-2 ${priorityColors[selectedItem.priority] || priorityColors['Medium']}`}>{selectedItem.priority}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Scheduled Date</label><p className="text-white">{selectedItem.scheduledDate?.split('T')[0]}</p></div>
                  <div><label className="text-xs text-gray-500">Status</label><span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ml-2 ${statusColors[selectedItem.status] || statusColors['Scheduled']}`}>{selectedItem.status}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Cost</label><p className="text-yellow-400 font-medium">{formatCurrency(selectedItem.cost || 0)}</p></div>
                  <div><label className="text-xs text-gray-500">Technician</label><p className="text-white">{selectedItem.technician || 'N/A'}</p></div>
                </div>
                {selectedItem.description && <div><label className="text-xs text-gray-500">Description</label><p className="text-gray-300">{selectedItem.description}</p></div>}
                {selectedItem.notes && <div><label className="text-xs text-gray-500">Notes</label><p className="text-gray-300">{selectedItem.notes}</p></div>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowViewModal(false); setSelectedItem(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Maintenance</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Title</label><input type="text" name="title" value={editFormData.title} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Asset</label><input type="text" name="assetName" value={editFormData.assetName} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select name="type" value={editFormData.type} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Preventive">Preventive</option>
                      <option value="Corrective">Corrective</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                    <select name="priority" value={editFormData.priority} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Scheduled Date</label><input type="date" name="scheduledDate" value={editFormData.scheduledDate?.split('T')[0]} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Cost</label><input type="number" name="cost" value={editFormData.cost} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Technician</label><input type="text" name="technician" value={editFormData.technician || ''} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg"><AlertCircle className="w-6 h-6 text-red-400" /></div>
                <h2 className="text-xl font-semibold text-white">Delete Maintenance</h2>
              </div>
              <p className="text-gray-400 mb-2">Are you sure you want to delete this maintenance record?</p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedItem.title}</p>
                <p className="text-sm text-gray-400">Asset: {selectedItem.assetName}</p>
                <p className="text-sm text-gray-400">Status: {selectedItem.status}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={confirmDelete} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
