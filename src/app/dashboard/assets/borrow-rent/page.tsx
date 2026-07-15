'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, Eye, ChevronUp, ChevronDown, MoreVertical, Filter,
  ChevronLeft, ChevronRight, Calendar, Package, User, Clock,
  CheckCircle, AlertCircle, XCircle, Download, Tag, X, Save, Loader2, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  'Draft': 'bg-gray-700 text-gray-400 border border-gray-600',
  'Approved': 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'Returned': 'bg-green-900/50 text-green-400 border border-green-800',
  'Overdue': 'bg-red-900/50 text-red-400 border border-red-800',
};

const statusIcons: Record<string, any> = {
  'Draft': AlertCircle,
  'Approved': CheckCircle,
  'Returned': RefreshCw,
  'Overdue': XCircle,
};

export default function BorrowRentPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets/borrow-rent');
      const data = await res.json();
      if (Array.isArray(data)) setRecords(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const filteredRecords = records.filter(r =>
    r.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.staffUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (r: any) => { setSelectedRecord(r); setShowViewModal(true); };
  const handleEdit = (r: any) => { setSelectedRecord(r); setEditFormData({ ...r }); setShowEditModal(true); };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/borrow-rent/${editFormData.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editFormData),
      });
      if (res.ok) { await fetchRecords(); setShowEditModal(false); setSelectedRecord(null); setEditFormData(null); }
    } finally { setIsLoading(false); }
  };
  const handleDelete = (r: any) => { setSelectedRecord(r); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/borrow-rent/${selectedRecord.id}`, { method: 'DELETE' });
      if (res.ok) { await fetchRecords(); setShowDeleteModal(false); setSelectedRecord(null); }
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
        <span>Dashboard</span><span className="text-gray-600">/</span><span>Assets</span><span className="text-gray-600">/</span><span className="text-white">Borrow & Rent</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Asset Borrow & Rent</h1>
          <p className="text-sm text-gray-400 mt-1">Manage asset borrow and rent records</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/dashboard/assets/borrow-rent/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> New Record
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search Records..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('assetName')}>
                  <div className="flex items-center gap-1"><Package className="w-3 h-3" /> Asset <SortIcon field="assetName" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('staffUserName')}>
                  <div className="flex items-center gap-1"><User className="w-3 h-3" /> User <SortIcon field="staffUserName" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('startDate')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date <SortIcon field="startDate" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('endDate')}>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> End Date <SortIcon field="endDate" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('actualReturnDate')}>
                  Actual Return <SortIcon field="actualReturnDate" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('quantity')}>
                  Quantity <SortIcon field="quantity" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No records found</td></tr>
              ) : pageItems.map((record) => {
                const StatusIcon = statusIcons[record.status] || AlertCircle;
                return (
                  <tr key={record.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-white">{record.assetName}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{record.staffUserName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{record.startDate?.split('T')[0]}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{record.endDate?.split('T')[0]}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{record.actualReturnDate?.split('T')[0] || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{record.quantity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[record.status] || statusColors['Draft']}`}>
                        <StatusIcon className="w-3 h-3" /> {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleView(record)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(record)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(record)} className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} results
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Next</button>
          </div>
        </div>
      </div>

      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Record Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedRecord(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div><h3 className="text-lg font-medium text-white">{selectedRecord.assetName}</h3><p className="text-sm text-gray-400">User: {selectedRecord.staffUserName}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Start Date</label><p className="text-white">{selectedRecord.startDate?.split('T')[0]}</p></div>
                  <div><label className="text-xs text-gray-500">End Date</label><p className="text-white">{selectedRecord.endDate?.split('T')[0]}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Actual Return Date</label><p className="text-white">{selectedRecord.actualReturnDate?.split('T')[0] || 'Not returned yet'}</p></div>
                  <div><label className="text-xs text-gray-500">Quantity</label><p className="text-white">{selectedRecord.quantity}</p></div>
                </div>
                <div><label className="text-xs text-gray-500">Status</label><span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ml-2 ${statusColors[selectedRecord.status] || statusColors['Draft']}`}>{selectedRecord.status}</span></div>
                {selectedRecord.purpose && <div><label className="text-xs text-gray-500">Purpose</label><p className="text-gray-300">{selectedRecord.purpose}</p></div>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowViewModal(false); setSelectedRecord(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
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
                <h2 className="text-xl font-semibold text-white">Edit Record</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedRecord(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Asset</label><input type="text" name="assetName" value={editFormData.assetName} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">User</label><input type="text" name="staffUserName" value={editFormData.staffUserName} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label><input type="date" name="startDate" value={editFormData.startDate?.split('T')[0]} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">End Date</label><input type="date" name="endDate" value={editFormData.endDate?.split('T')[0]} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Actual Return Date</label><input type="date" name="actualReturnDate" value={editFormData.actualReturnDate?.split('T')[0] || ''} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label><input type="number" name="quantity" value={editFormData.quantity} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Returned">Returned</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); setSelectedRecord(null); setEditFormData(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg"><AlertCircle className="w-6 h-6 text-red-400" /></div>
                <h2 className="text-xl font-semibold text-white">Delete Record</h2>
              </div>
              <p className="text-gray-400 mb-2">Are you sure you want to delete this borrow/rent record?</p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedRecord.assetName}</p>
                <p className="text-sm text-gray-400">User: {selectedRecord.staffUserName}</p>
                <p className="text-sm text-gray-400">Status: {selectedRecord.status}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setSelectedRecord(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
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
