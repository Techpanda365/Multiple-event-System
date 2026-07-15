'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, Eye, ChevronUp, ChevronDown, MoreVertical, Filter,
  ChevronLeft, ChevronRight, MapPin, Building2, Warehouse, Home, Layers,
  CheckCircle, XCircle, Download, Tag, Hash, X, Save, AlertCircle, Loader2,
  Globe, Phone, Mail, User
} from 'lucide-react';
import Link from 'next/link';

const locationTypes = ['Building', 'Warehouse', 'Site', 'Floor', 'Room', 'Office'];

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets/locations');
      const data = await res.json();
      if (Array.isArray(data)) setLocations(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const filteredLocations = locations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.parentLocation || '-').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredLocations.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (location: any) => { setSelectedLocation(location); setShowViewModal(true); };
  const handleEdit = (location: any) => { setSelectedLocation(location); setEditFormData({ ...location }); setShowEditModal(true); };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/locations/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) { await fetchLocations(); setShowEditModal(false); setSelectedLocation(null); setEditFormData(null); }
    } finally { setIsLoading(false); }
  };

  const handleDelete = (location: any) => { setSelectedLocation(location); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/locations/${selectedLocation.id}`, { method: 'DELETE' });
      if (res.ok) { await fetchLocations(); setShowDeleteModal(false); setSelectedLocation(null); }
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

  const getStatusBadge = (status: string) => {
    if (status === 'Active') return 'bg-green-900/50 text-green-400 border border-green-800';
    return 'bg-red-900/50 text-red-400 border border-red-800';
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Building': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'Warehouse': return <Warehouse className="w-4 h-4 text-yellow-400" />;
      case 'Site': return <MapPin className="w-4 h-4 text-green-400" />;
      case 'Floor': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Room': return <Home className="w-4 h-4 text-orange-400" />;
      default: return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span><span>Assets</span><span className="text-gray-600">/</span><span className="text-white">Locations</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Locations</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all asset locations</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/dashboard/assets/locations/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Add Location
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search locations..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Name <SortIcon field="name" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('code')}>
                  <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> Code <SortIcon field="code" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> Type <SortIcon field="type" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('parentLocation')}>
                  <div className="flex items-center gap-1"><Layers className="w-3 h-3" /> Parent <SortIcon field="parentLocation" /></div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('isActive')}>
                  Status <SortIcon field="isActive" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No locations found</td></tr>
              ) : pageItems.map((location) => (
                <tr key={location.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(location.type)}
                      <span className="text-sm text-white">{location.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-blue-400">{location.code}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{location.type}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{location.parentLocation || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(location.isActive ? 'Active' : 'Inactive')}`}>
                      {location.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleView(location)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(location)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(location)} className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-500 hover:text-gray-400 transition p-1 hover:bg-gray-700/30 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLocations.length)} of {filteredLocations.length} results
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Next</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Location Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedLocation(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedLocation.type)}
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedLocation.name}</h3>
                    <span className="text-sm text-gray-400">{selectedLocation.code}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Type</label><p className="text-white">{selectedLocation.type}</p></div>
                  <div><label className="text-xs text-gray-500">Parent Location</label><p className="text-white">{selectedLocation.parentLocation || '-'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedLocation.isActive ? 'Active' : 'Inactive')}`}>
                      {selectedLocation.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {selectedLocation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div><label className="text-xs text-gray-500">Contact</label><p className="text-white">{selectedLocation.contactPerson || 'N/A'}</p></div>
                </div>
                {selectedLocation.address && (
                  <div>
                    <label className="text-xs text-gray-500">Address</label>
                    <p className="text-gray-300">{selectedLocation.address}</p>
                    <p className="text-gray-300">{[selectedLocation.city, selectedLocation.state, selectedLocation.postalCode].filter(Boolean).join(', ')}</p>
                    <p className="text-gray-300">{selectedLocation.country}</p>
                  </div>
                )}
                {selectedLocation.contactPhone && <div><label className="text-xs text-gray-500">Contact Phone</label><p className="text-white">{selectedLocation.contactPhone}</p></div>}
                {selectedLocation.contactEmail && <div><label className="text-xs text-gray-500">Contact Email</label><p className="text-white">{selectedLocation.contactEmail}</p></div>}
                {selectedLocation.description && <div><label className="text-xs text-gray-500">Description</label><p className="text-gray-300">{selectedLocation.description}</p></div>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowViewModal(false); setSelectedLocation(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Location</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedLocation(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Code</label>
                    <input type="text" name="code" value={editFormData.code} onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select name="type" value={editFormData.type} onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {locationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Parent Location</label>
                    <input type="text" name="parentLocation" value={editFormData.parentLocation || ''} onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select name="isActive" value={String(editFormData.isActive)} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contact Person</label>
                  <input type="text" name="contactPerson" value={editFormData.contactPerson || ''} onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); setSelectedLocation(null); setEditFormData(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg"><AlertCircle className="w-6 h-6 text-red-400" /></div>
                <h2 className="text-xl font-semibold text-white">Delete Location</h2>
              </div>
              <p className="text-gray-400 mb-2">Are you sure you want to delete this location?</p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedLocation.name}</p>
                <p className="text-sm text-gray-400">Code: {selectedLocation.code}</p>
                <p className="text-sm text-gray-400">Type: {selectedLocation.type}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setSelectedLocation(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={confirmDelete} disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
