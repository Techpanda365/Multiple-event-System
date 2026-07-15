// app/dashboard/accounting/debit-notes/page.tsx
'use client';

import { useState } from 'react';
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
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Calendar,
  Hash,
  DollarSign,
  Landmark,
  Loader2,
  X,
  Save,
  FileText,
  CreditCard,
  Banknote,
  Tag,
  Building2,
  UserCheck,
  FileSpreadsheet,
  ArrowLeftRight
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const initialDebitNotes = [
  { 
    id: 1,
    debitNoteNumber: 'DN-2026-02-006',
    purchaseReturn: 'PR-2026-02-007',
    vendor: 'Smart Systems Inc',
    date: '2026-02-10',
    totalAmount: 4774.00,
    balance: 4774.00,
    status: 'Draft',
    approvedBy: '',
    description: 'Return of defective items'
  },
  { 
    id: 2,
    debitNoteNumber: 'DN-2026-02-005',
    purchaseReturn: 'PR-2026-02-006',
    vendor: 'Reliable Resources',
    date: '2026-02-09',
    totalAmount: 289.28,
    balance: 289.28,
    status: 'Draft',
    approvedBy: '',
    description: 'Damaged goods returned'
  },
  { 
    id: 3,
    debitNoteNumber: 'DN-2026-02-004',
    purchaseReturn: 'PR-2026-02-005',
    vendor: 'Tech Solutions Inc',
    date: '2026-02-09',
    totalAmount: 580.00,
    balance: 580.00,
    status: 'Approved',
    approvedBy: 'Company',
    description: 'Incorrect items returned'
  },
  { 
    id: 4,
    debitNoteNumber: 'DN-2026-02-003',
    purchaseReturn: 'PR-2026-02-004',
    vendor: 'Reliable Resources',
    date: '2026-02-09',
    totalAmount: 482.13,
    balance: 482.13,
    status: 'Approved',
    approvedBy: 'Company',
    description: 'Short shipment refund'
  },
  { 
    id: 5,
    debitNoteNumber: 'DN-2026-02-002',
    purchaseReturn: 'PR-2026-02-002',
    vendor: 'Sam Supplier',
    date: '2026-02-09',
    totalAmount: 4225.00,
    balance: 4225.00,
    status: 'Draft',
    approvedBy: '',
    description: 'Quality issues return'
  },
  { 
    id: 6,
    debitNoteNumber: 'DN-2026-02-001',
    purchaseReturn: 'PR-2026-02-001',
    vendor: 'Alex Vendor',
    date: '2026-02-09',
    totalAmount: 156.00,
    balance: 0.00,
    status: 'Applied',
    approvedBy: 'Company',
    description: 'Full refund processed'
  },
];

const vendors = [
  'Smart Systems Inc',
  'Reliable Resources',
  'Alex Vendor',
  'Tech Solutions Inc',
  'Sam Supplier'
];

export default function DebitNotesPage() {
  const [debitNotes, setDebitNotes] = useState(initialDebitNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // View Debit Note
  const handleView = (note: any) => {
    setSelectedDebitNote(note);
    setShowViewModal(true);
  };

  // Edit Debit Note
  const handleEdit = (note: any) => {
    setSelectedDebitNote(note);
    setEditFormData({ ...note });
    setShowEditModal(true);
  };

  // Delete Debit Note
  const handleDelete = (note: any) => {
    setSelectedDebitNote(note);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setDebitNotes(prev => prev.filter(n => n.id !== selectedDebitNote.id));
    setShowDeleteModal(false);
    setSelectedDebitNote(null);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setDebitNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, status: newStatus }
            : note
        )
      );
      setProcessingId(null);
    }, 500);
  };

  // Save Edit
  const handleSaveEdit = () => {
    setDebitNotes(prev =>
      prev.map(note =>
        note.id === editFormData.id
          ? { ...editFormData }
          : note
      )
    );
    setShowEditModal(false);
    setSelectedDebitNote(null);
    setEditFormData(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const filteredDebitNotes = debitNotes.filter(note =>
    note.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.purchaseReturn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDebitNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDebitNotes = filteredDebitNotes.slice(startIndex, startIndex + itemsPerPage);

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

  const getStatusBadge = (status: string) => {
    if (status === 'Applied') {
      return 'bg-green-900/50 text-green-400 border border-green-800';
    }
    if (status === 'Approved') {
      return 'bg-blue-900/50 text-blue-400 border border-blue-800';
    }
    if (status === 'Draft') {
      return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
    }
    if (status === 'Cancelled') {
      return 'bg-red-900/50 text-red-400 border border-red-800';
    }
    if (status === 'Partially Applied') {
      return 'bg-purple-900/50 text-purple-400 border border-purple-800';
    }
    return 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Applied') return <CheckCircle className="w-3 h-3" />;
    if (status === 'Approved') return <UserCheck className="w-3 h-3" />;
    if (status === 'Draft') return <Clock className="w-3 h-3" />;
    if (status === 'Cancelled') return <XCircle className="w-3 h-3" />;
    if (status === 'Partially Applied') return <AlertCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const statusOptions = ['Draft', 'Approved', 'Applied', 'Partially Applied', 'Cancelled'];

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Accounting</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Debit Notes</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Debit Notes</h1>
          <p className="text-sm text-gray-400 mt-1">Manage debit notes issued to vendors</p>
        </div>
        {/* <Link href="/dashboard/accounting/debit-notes/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            New Debit Note
          </button>
        </Link> */}
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by debit note number..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('debitNoteNumber')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Debit Note Number <SortIcon field="debitNoteNumber" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('purchaseReturn')}>
                  <div className="flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3" />
                    Purchase Return <SortIcon field="purchaseReturn" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('vendor')}>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Vendor <SortIcon field="vendor" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('totalAmount')}>
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total Amount <SortIcon field="totalAmount" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('balance')}>
                  <div className="flex items-center justify-end gap-1">
                    Balance <SortIcon field="balance" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('approvedBy')}>
                  Approved By <SortIcon field="approvedBy" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentDebitNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-blue-400">{note.debitNoteNumber}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{note.purchaseReturn}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-white">{note.vendor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{note.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                    {formatCurrency(note.totalAmount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                    <span className={note.balance === 0 ? 'text-green-400' : 'text-yellow-400'}>
                      {formatCurrency(note.balance)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="relative">
                      <select
                        value={note.status}
                        onChange={(e) => handleStatusChange(note.id, e.target.value)}
                        disabled={processingId === note.id}
                        className={`px-2 py-1 text-xs rounded-full border appearance-none cursor-pointer pr-6 ${getStatusBadge(note.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status} className="bg-gray-800 text-white">
                            {status}
                          </option>
                        ))}
                      </select>
                      {processingId === note.id && (
                        <Loader2 className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 animate-spin" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{note.approvedBy || '-'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleView(note)}
                        className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded"
                        title="View Debit Note"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(note)}
                        className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded"
                        title="Edit Debit Note"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(note)}
                        className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded"
                        title="Delete Debit Note"
                      >
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

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDebitNotes.length)} of {filteredDebitNotes.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============ VIEW MODAL ============ */}
      {showViewModal && selectedDebitNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Debit Note Details</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedDebitNote(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Debit Note Number</label>
                    <p className="text-white font-mono">{selectedDebitNote.debitNoteNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Purchase Return</label>
                    <p className="text-white">{selectedDebitNote.purchaseReturn}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Vendor</label>
                    <p className="text-white">{selectedDebitNote.vendor}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date</label>
                    <p className="text-white">{selectedDebitNote.date}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Total Amount</label>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedDebitNote.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Balance</label>
                    <p className={`text-2xl font-bold ${selectedDebitNote.balance === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {formatCurrency(selectedDebitNote.balance)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedDebitNote.status)}`}>
                      {getStatusIcon(selectedDebitNote.status)}
                      {selectedDebitNote.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Approved By</label>
                    <p className="text-white">{selectedDebitNote.approvedBy || 'Not approved yet'}</p>
                  </div>
                </div>
                
                {selectedDebitNote.description && (
                  <div>
                    <label className="text-xs text-gray-500">Description</label>
                    <p className="text-gray-300">{selectedDebitNote.description}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedDebitNote(null); }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Debit Note</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedDebitNote(null); setEditFormData(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Debit Note Number</label>
                    <input
                      type="text"
                      name="debitNoteNumber"
                      value={editFormData.debitNoteNumber}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Return</label>
                    <input
                      type="text"
                      name="purchaseReturn"
                      value={editFormData.purchaseReturn}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Vendor</label>
                    <select
                      name="vendor"
                      value={editFormData.vendor}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {vendors.map((vendor) => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount</label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={editFormData.totalAmount}
                      onChange={handleEditChange}
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Balance</label>
                    <input
                      type="number"
                      name="balance"
                      value={editFormData.balance}
                      onChange={handleEditChange}
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Approved By</label>
                    <input
                      type="text"
                      name="approvedBy"
                      value={editFormData.approvedBy || ''}
                      onChange={handleEditChange}
                      placeholder="Enter approver name"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleEditChange}
                    rows={3}
                    placeholder="Enter description"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedDebitNote(null); setEditFormData(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {showDeleteModal && selectedDebitNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Debit Note</h2>
              </div>
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this debit note?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-mono">{selectedDebitNote.debitNoteNumber}</p>
                <p className="text-sm text-gray-400">Vendor: {selectedDebitNote.vendor}</p>
                <p className="text-sm font-medium text-white">{formatCurrency(selectedDebitNote.totalAmount)}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedDebitNote(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}