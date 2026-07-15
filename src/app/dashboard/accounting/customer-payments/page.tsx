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
  XCircle,
  Users,
  Calendar,
  Hash,
  DollarSign,
  Landmark,
  Loader2,
  CreditCard,
  User
} from 'lucide-react';
import Link from 'next/link';

interface CustomerPayment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  bankAccountId: string | null;
  referenceNumber: string | null;
  notes: string | null;
  status: string;
  customer: { id: string; name: string; email: string | null } | null;
  bankAccount?: { id: string; name: string } | null;
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CustomerPayment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/customer-payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPayments();
    })();
  }, []);

  const handleDelete = (payment: CustomerPayment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    setDeletingId(selectedPayment.id);
    try {
      await fetch(`/api/accounting/customer-payments/${selectedPayment.id}`, { method: 'DELETE' });
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedPayment(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/accounting/customer-payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPayments(prev => prev.map(p => (p.id === id ? updated : p)));
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const q = searchTerm.toLowerCase();
    return (
      payment.paymentNumber.toLowerCase().includes(q) ||
      (payment.customer?.name?.toLowerCase() || '').includes(q) ||
      (payment.referenceNumber?.toLowerCase() || '').includes(q)
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPayments = [...currentPayments].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDirection === 'asc' ? 1 : -1;
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (sortField) {
      case 'paymentNumber': aVal = a.paymentNumber; bVal = b.paymentNumber; break;
      case 'customer': aVal = a.customer?.name || ''; bVal = b.customer?.name || ''; break;
      case 'paymentDate': aVal = a.paymentDate; bVal = b.paymentDate; break;
      case 'amount': aVal = a.amount; bVal = b.amount; break;
    }
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'cleared') {
      return 'bg-green-900/50 text-green-400 border border-green-800';
    }
    if (status === 'pending') {
      return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
    }
    if (status === 'cancelled') {
      return 'bg-red-900/50 text-red-400 border border-red-800';
    }
    return 'bg-gray-700 text-gray-400 border border-gray-600';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed' || status === 'cleared') return <CheckCircle className="w-3 h-3" />;
    if (status === 'pending') return <Clock className="w-3 h-3" />;
    if (status === 'cancelled') return <XCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Accounting</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Customer Payments</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Customer Payments</h1>
          <p className="text-sm text-gray-400 mt-1">Manage payments received from customers</p>
        </div>
        <Link href="/dashboard/accounting/customer-payments/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            New Payment
          </button>
        </Link>
      </div>

      {/* Search & Filters */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('paymentNumber')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Payment Number <SortIcon field="paymentNumber" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('customer')}>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Customer <SortIcon field="customer" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('paymentDate')}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Payment Date <SortIcon field="paymentDate" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    Amount <SortIcon field="amount" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Landmark className="w-3 h-3" />
                    Bank Account
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading payments...
                  </td>
                </tr>
              ) : sortedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                sortedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-400">{payment.paymentNumber}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-white">{payment.customer?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                          {payment.bankAccount?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'completed')}
                          disabled={updatingId === payment.id}
                          className="text-green-400 hover:text-green-300 transition p-1 hover:bg-green-900/20 rounded"
                          title="Mark Cleared"
                        >
                          {updatingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'cancelled')}
                          disabled={updatingId === payment.id}
                          className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded"
                          title="Cancel Payment"
                        >
                          {updatingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-gray-400 hover:text-gray-300 transition p-1 hover:bg-gray-700/30 rounded"
                          title="Delete Payment"
                          disabled={deletingId === payment.id}
                        >
                          {deletingId === payment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredPayments.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} results
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
        )}
      </div>

      {/* ============ DELETE MODAL ============ */}
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
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this payment?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-mono">{selectedPayment.paymentNumber}</p>
                <p className="text-sm text-gray-400">Customer: {selectedPayment.customer?.name || '—'}</p>
                <p className="text-sm font-medium text-white">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedPayment(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deletingId === selectedPayment.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {deletingId === selectedPayment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
