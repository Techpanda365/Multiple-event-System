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
  Calendar,
  DollarSign,
  User,
  Package,
  Hash,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  X,
  Save,
  Loader2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  'Draft': 'bg-gray-700 text-gray-400 border border-gray-600',
  'Paid': 'bg-green-900/50 text-green-400 border border-green-800',
  'Overdue': 'bg-red-900/50 text-red-400 border border-red-800',
  'Cancelled': 'bg-red-900/50 text-red-400 border border-red-800',
};

const statusIcons: Record<string, any> = {
  'Draft': Clock,
  'Paid': CheckCircle,
  'Overdue': AlertCircle,
  'Cancelled': XCircle,
};

interface Payment {
  id: string;
  assetName: string;
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  referenceNumber: string | null;
  status: string;
  notes: string | null;
  borrowRentId: string | null;
}

export default function BorrowRentPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortField,
        sortDirection,
      });
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/assets/borrow-rent/payment?${params}`);
      const data = await res.json();
      setPayments(data.payments);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [currentPage, itemsPerPage, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPayments();
  }, [searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditFormData({ ...payment });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/borrow-rent/payment/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchPayments();
      setShowEditModal(false);
      setSelectedPayment(null);
      setEditFormData(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/assets/borrow-rent/payment/${selectedPayment!.id}`, { method: 'DELETE' });
      await fetchPayments();
      setShowDeleteModal(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Assets</span>
        <span className="text-gray-600">/</span>
        <span>Borrow & Rent</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Payments</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Asset Borrow & Rent Payments</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all borrow & rent payments</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          {/* <Link href="/dashboard/assets/borrow-rent/payment/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              New Payment
            </button>
          </Link> */}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments..."
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
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('assetName')}>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Asset <SortIcon field="assetName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Customer Name <SortIcon field="customerName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('paymentAmount')}>
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    Payment Amount <SortIcon field="paymentAmount" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('paymentDate')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Payment Date <SortIcon field="paymentDate" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('referenceNumber')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Reference Number <SortIcon field="referenceNumber" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payments.map((payment) => {
                const StatusIcon = statusIcons[payment.status] || AlertCircle;
                return (
                  <tr key={payment.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{payment.assetName}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{payment.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-yellow-400 font-medium">
                      {formatCurrency(payment.paymentAmount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{formatDate(payment.paymentDate)}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-400">{payment.referenceNumber || '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[payment.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleView(payment)} className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(payment)} className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(payment)} className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-400 transition p-1 hover:bg-gray-700/30 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, total)} of {total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
              Previous
            </button>
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

      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Payment Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedPayment(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedPayment.assetName}</h3>
                  <p className="text-sm text-gray-400">Customer: {selectedPayment.customerName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Payment Amount</label>
                    <p className="text-yellow-400 font-medium text-lg">{formatCurrency(selectedPayment.paymentAmount)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Payment Date</label>
                    <p className="text-white">{formatDate(selectedPayment.paymentDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Reference Number</label>
                    <p className="text-white font-mono">{selectedPayment.referenceNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[selectedPayment.status]}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
                {selectedPayment.notes && (
                  <div>
                    <label className="text-xs text-gray-500">Notes</label>
                    <p className="text-white">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowViewModal(false); setSelectedPayment(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                  Close
                </button>
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
                <h2 className="text-xl font-semibold text-white">Edit Payment</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedPayment(null); setEditFormData(null); }} className="p-1 hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Asset</label>
                    <input type="text" name="assetName" value={editFormData.assetName} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                    <input type="text" name="customerName" value={editFormData.customerName} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Amount ($)</label>
                    <input type="number" step="0.01" name="paymentAmount" value={editFormData.paymentAmount} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Date</label>
                    <input type="date" name="paymentDate" value={editFormData.paymentDate?.split('T')[0]} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
                    <input type="text" name="referenceNumber" value={editFormData.referenceNumber || ''} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Draft">Draft</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                  <textarea name="notes" value={editFormData.notes || ''} onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); setSelectedPayment(null); setEditFormData(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Payment</h2>
              </div>
              <p className="text-gray-400 mb-2">Are you sure you want to delete this payment?</p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedPayment.assetName}</p>
                <p className="text-sm text-gray-400">Customer: {selectedPayment.customerName}</p>
                <p className="text-sm text-gray-400">Amount: {formatCurrency(selectedPayment.paymentAmount)}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setSelectedPayment(null); }} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
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