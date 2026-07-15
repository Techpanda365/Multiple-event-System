// app/dashboard/projects/payments/page.tsx
'use client';

import { useState, useRef } from 'react';
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
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Printer,
  Tag,
  Hash,
  X,
  Save,
  Loader2,
  FolderKanban,
  BarChart3,
  User,
  CalendarDays,
  Briefcase,
  Target,
  Layers,
  FileText,
  Building2,
  CreditCard,
  Wrench,
  Car,
  Laptop,
  Monitor,
  Smartphone,
  Truck,
  HardDrive,
  Mic,
  Headphones,
  Camera,
  Home,
  Package,
  Box,
  FolderOpen,
  FileImage,
  Video,
  Music,
  Archive,
  GitBranch,
  ListChecks,
  PlusCircle,
  FileSpreadsheet,
  Copy,
  ArrowRight,
  RefreshCw,
  Wallet,
  Receipt,
  Banknote,
  Send,
  CheckSquare,
  Clock as ClockIcon,
  FileDown,
  File
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock data
const initialPayments = [
  { 
    id: 1,
    paymentNumber: 'PAY-00026',
    project: 'Security Audit & Compliance',
    customer: 'Global Solutions Ltd',
    paymentDate: '2026-01-10',
    dueDate: '2026-01-28',
    subtotal: 46000.00,
    discount: 3430.00,
    totalAmount: 42570.00,
    balanceDue: 42570.00,
    status: 'Draft'
  },
  { 
    id: 2,
    paymentNumber: 'PAY-00031',
    project: 'Smart IoT Home Automation',
    customer: 'Jennifer Martinez',
    paymentDate: '2026-02-12',
    dueDate: '2026-02-22',
    subtotal: 18000.00,
    discount: 2520.00,
    totalAmount: 15480.00,
    balanceDue: 8915.00,
    status: 'Posted'
  },
  { 
    id: 3,
    paymentNumber: 'PAY-00030',
    project: 'Smart IoT Home Automation',
    customer: 'Jennifer Martinez',
    paymentDate: '2026-01-24',
    dueDate: '2026-01-24',
    subtotal: 12000.00,
    discount: 1200.00,
    totalAmount: 10800.00,
    balanceDue: 3575.00,
    status: 'Posted'
  },
  { 
    id: 4,
    paymentNumber: 'PAY-00029',
    project: 'Customer Feedback Portal',
    customer: 'Global Solutions Ltd',
    paymentDate: '2026-01-14',
    dueDate: '2026-01-14',
    subtotal: 12000.00,
    discount: 480.00,
    totalAmount: 11520.00,
    balanceDue: 7005.00,
    status: 'Draft'
  },
  { 
    id: 5,
    paymentNumber: 'PAY-00028',
    project: 'Security Audit & Compliance',
    customer: 'Global Solutions Ltd',
    paymentDate: '2026-01-31',
    dueDate: '2026-01-31',
    subtotal: 35000.00,
    discount: 1890.00,
    totalAmount: 33110.00,
    balanceDue: 26626.00,
    status: 'Posted'
  },
  { 
    id: 6,
    paymentNumber: 'PAY-00027',
    project: 'Security Audit & Compliance',
    customer: 'Global Solutions Ltd',
    paymentDate: '2026-01-12',
    dueDate: '2026-01-27',
    subtotal: 22000.00,
    discount: 220.00,
    totalAmount: 21780.00,
    balanceDue: 0.00,
    status: 'Completed'
  },
  { 
    id: 7,
    paymentNumber: 'PAY-00024',
    project: 'AI Chatbot Development',
    customer: 'Tech Innovations Inc',
    paymentDate: '2025-12-20',
    dueDate: '2026-01-05',
    subtotal: 36000.00,
    discount: 3790.00,
    totalAmount: 32210.00,
    balanceDue: 0.00,
    status: 'Completed'
  },
  { 
    id: 8,
    paymentNumber: 'PAY-00022',
    project: 'Food Delivery Application',
    customer: 'Elite Enterprises',
    paymentDate: '2025-12-17',
    dueDate: '2026-01-27',
    subtotal: 27000.00,
    discount: 1145.00,
    totalAmount: 25855.00,
    balanceDue: 0.00,
    status: 'Completed'
  },
  { 
    id: 9,
    paymentNumber: 'PAY-00023',
    project: 'Data Analytics Dashboard',
    customer: 'Professional Services',
    paymentDate: '2026-01-03',
    dueDate: '2026-01-19',
    subtotal: 39500.00,
    discount: 4240.00,
    totalAmount: 35260.00,
    balanceDue: 0.00,
    status: 'Posted'
  },
  { 
    id: 10,
    paymentNumber: 'PAY-00032',
    project: 'Smart IoT Home Automation',
    customer: 'Jennifer Martinez',
    paymentDate: '2026-01-30',
    dueDate: '2026-01-30',
    subtotal: 20500.00,
    discount: 2030.00,
    totalAmount: 18470.00,
    balanceDue: 0.00,
    status: 'Posted'
  },
];

const statusColors = {
  'Draft': 'bg-gray-700 text-gray-400 border border-gray-600',
  'Posted': 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'Completed': 'bg-green-900/50 text-green-400 border border-green-800',
  'Cancelled': 'bg-red-900/50 text-red-400 border border-red-800',
};

const statusIcons = {
  'Draft': ClockIcon,
  'Posted': Send,
  'Completed': CheckCircle,
  'Cancelled': XCircle,
};

export default function ProjectPaymentsPage() {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate summary
  const yearlyPayment = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const quarterlyPayment = 0;
  const monthlyPayment = 0;
  const todaysPayment = 0;

  const filteredPayments = payments.filter(payment =>
    payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  // ============ VIEW ============
  const handleView = (payment: any) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // ============ EDIT ============
  const handleEdit = (payment: any) => {
    setSelectedPayment(payment);
    setEditFormData({ ...payment });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSaveEdit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPayments(prev =>
        prev.map(payment =>
          payment.id === editFormData.id
            ? { ...editFormData }
            : payment
        )
      );
      setIsLoading(false);
      setShowEditModal(false);
      setSelectedPayment(null);
      setEditFormData(null);
    }, 1000);
  };

  // ============ DELETE ============
  const handleDelete = (payment: any) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedPayment(null);
    }, 1000);
  };

  // ============ POST PAYMENT ============
  const handlePost = (payment: any) => {
    setSelectedPayment(payment);
    setShowPostModal(true);
  };

  const confirmPost = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPayments(prev =>
        prev.map(payment =>
          payment.id === selectedPayment.id
            ? { ...payment, status: 'Posted' }
            : payment
        )
      );
      setIsLoading(false);
      setShowPostModal(false);
      setSelectedPayment(null);
    }, 1000);
  };

  // ============ DOWNLOAD PDF ============
  const downloadPDF = (payment: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Project Payment Details', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 34, 196, 34);
    
    // Payment Details
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Payment Information', 14, 44);
    
    const details = [
      ['Payment Number', payment.paymentNumber],
      ['Project', payment.project],
      ['Customer', payment.customer],
      ['Status', payment.status],
      ['Payment Date', payment.paymentDate],
      ['Due Date', payment.dueDate],
      ['Subtotal', formatCurrency(payment.subtotal)],
      ['Discount', formatCurrency(payment.discount)],
      ['Total Amount', formatCurrency(payment.totalAmount)],
      ['Balance Due', formatCurrency(payment.balanceDue)],
    ];
    
    autoTable(doc, {
      startY: 48,
      head: [['Field', 'Value']],
      body: details,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 },
      },
      margin: { left: 14, right: 14 },
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system generated document.', 14, finalY);
    doc.text(`Page 1 of 1`, 190, finalY, { align: 'right' });
    
    doc.save(`Payment_${payment.paymentNumber}.pdf`);
  };

  // ============ DOWNLOAD ALL PAYMENTS PDF ============
  const downloadAllPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Project Payments Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Payments: ${payments.length}`, 14, 36);
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 40, 196, 40);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 14, 50);
    
    autoTable(doc, {
      startY: 54,
      head: [['Metric', 'Value']],
      body: [
        ['Yearly Payment', formatCurrency(yearlyPayment)],
        ['Quarterly Payment', formatCurrency(quarterlyPayment)],
        ['Monthly Payment', formatCurrency(monthlyPayment)],
        ['Today\'s Payment', formatCurrency(todaysPayment)],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
      },
      margin: { left: 14, right: 14 },
    });
    
    // All Payments Table
    const finalY1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('All Payments', 14, finalY1);
    
    const tableData = payments.map(p => [
      p.paymentNumber,
      p.project,
      p.customer,
      p.paymentDate,
      formatCurrency(p.totalAmount),
      p.status
    ]);
    
    autoTable(doc, {
      startY: finalY1 + 4,
      head: [['Payment #', 'Project', 'Customer', 'Date', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });
    
    // Footer
    const finalY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system generated document.', 14, finalY2);
    doc.text(`Page 1 of 1`, 190, finalY2, { align: 'right' });
    
    doc.save('All_Project_Payments.pdf');
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Project</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Payments</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Project Payments</h1>
          <p className="text-sm text-gray-400 mt-1">Post payment to finalize</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadAllPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <Link href="/dashboard/projects/payments/create">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Yearly Payment</p>
          <p className="text-xl font-bold text-white">{formatCurrency(yearlyPayment)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Quarterly Payment</p>
          <p className="text-xl font-bold text-white">{formatCurrency(quarterlyPayment)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Monthly Payment</p>
          <p className="text-xl font-bold text-white">{formatCurrency(monthlyPayment)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400">Today's Payment</p>
          <p className="text-xl font-bold text-white">{formatCurrency(todaysPayment)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by payment number..."
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

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPayments.map((payment) => {
          const StatusIcon = statusIcons[payment.status as keyof typeof statusIcons] || ClockIcon;
          return (
            <div key={payment.id} className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-500 transition p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{payment.paymentNumber}</p>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full ${statusColors[payment.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {payment.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-white">{payment.project}</h3>
                </div>
                <div className="flex gap-0.5">
                  <button 
                    onClick={() => handleView(payment)}
                    className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded"
                    title="View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleEdit(payment)}
                    className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => downloadPDF(payment)}
                    className="text-purple-400 hover:text-purple-300 transition p-1 hover:bg-purple-900/20 rounded"
                    title="Download PDF"
                  >
                    <File className="w-3.5 h-3.5" />
                  </button>
                  {payment.status === 'Draft' && (
                    <button 
                      onClick={() => handlePost(payment)}
                      className="text-green-400 hover:text-green-300 transition p-1 hover:bg-green-900/20 rounded"
                      title="Post Payment"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(payment)}
                    className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Customer */}
              <p className="text-sm text-gray-400 mb-3">Customer: {payment.customer}</p>

              {/* Dates */}
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>Payment: {payment.paymentDate}</span>
                <span>Due: {payment.dueDate}</span>
              </div>

              {/* Amounts */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">{formatCurrency(payment.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount:</span>
                  <span className="text-green-400">-{formatCurrency(payment.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-1 mt-1">
                  <span className="text-gray-400 font-medium">Total Amount:</span>
                  <span className="text-yellow-400 font-medium">{formatCurrency(payment.totalAmount)}</span>
                </div>
                {payment.balanceDue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Balance Due:</span>
                    <span className="text-red-400 text-xs font-medium">{formatCurrency(payment.balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} results
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

      {/* ============ VIEW MODAL ============ */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Payment Details</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedPayment(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{selectedPayment.paymentNumber}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusColors[selectedPayment.status as keyof typeof statusColors]}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white">{selectedPayment.project}</h3>
                  <p className="text-sm text-gray-400">Customer: {selectedPayment.customer}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Payment Date</label>
                    <p className="text-white">{selectedPayment.paymentDate}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Due Date</label>
                    <p className="text-white">{selectedPayment.dueDate}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Subtotal</label>
                    <p className="text-white">{formatCurrency(selectedPayment.subtotal)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Discount</label>
                    <p className="text-green-400">{formatCurrency(selectedPayment.discount)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Total Amount</label>
                    <p className="text-yellow-400 font-medium">{formatCurrency(selectedPayment.totalAmount)}</p>
                  </div>
                </div>
                
                {selectedPayment.balanceDue > 0 && (
                  <div>
                    <label className="text-xs text-gray-500">Balance Due</label>
                    <p className="text-red-400 font-medium">{formatCurrency(selectedPayment.balanceDue)}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedPayment(null); }}
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
                <h2 className="text-xl font-semibold text-white">Edit Payment</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedPayment(null); setEditFormData(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Number</label>
                    <input
                      type="text"
                      name="paymentNumber"
                      value={editFormData.paymentNumber}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                    <input
                      type="text"
                      name="project"
                      value={editFormData.project}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Customer</label>
                    <input
                      type="text"
                      name="customer"
                      value={editFormData.customer}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Posted">Posted</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subtotal</label>
                    <input
                      type="number"
                      name="subtotal"
                      value={editFormData.subtotal}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Discount</label>
                    <input
                      type="number"
                      name="discount"
                      value={editFormData.discount}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Balance Due</label>
                    <input
                      type="number"
                      name="balanceDue"
                      value={editFormData.balanceDue}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedPayment(null); setEditFormData(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ POST PAYMENT MODAL ============ */}
      {showPostModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <Send className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Post Payment</h2>
              </div>
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to post this payment?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedPayment.paymentNumber}</p>
                <p className="text-sm text-gray-400">Project: {selectedPayment.project}</p>
                <p className="text-sm text-yellow-400 font-medium">{formatCurrency(selectedPayment.totalAmount)}</p>
              </div>
              <p className="text-sm text-gray-500">This will finalize the payment and update the balance.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowPostModal(false); setSelectedPayment(null); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPost}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-sm text-white font-medium">{selectedPayment.paymentNumber}</p>
                <p className="text-sm text-gray-400">Project: {selectedPayment.project}</p>
                <p className="text-sm text-gray-400">Amount: {formatCurrency(selectedPayment.totalAmount)}</p>
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
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}