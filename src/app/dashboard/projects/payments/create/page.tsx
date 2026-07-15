// app/dashboard/projects/payments/create/page.tsx
'use client';

import { useState } from 'react';
import { 
  ChevronLeft,
  Calendar,
  FolderKanban,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Percent,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  Wallet,
  Receipt,
  Banknote,
  Tag,
  Hash,
  Building2,
  Edit2,
  CheckCircle,
  Clock as ClockIcon,
  Send,
  FileDown
} from 'lucide-react';
import Link from 'next/link';

const projects = ['Select Project', 'Security Audit & Compliance', 'Smart IoT Home Automation', 'Customer Feedback Portal', 'AI Chatbot Development', 'Data Analytics Dashboard'];
const customers = ['Select Project First', 'Global Solutions Ltd', 'Jennifer Martinez', 'Tech Innovations Inc', 'Elite Enterprises', 'Professional Services'];
const bankAccounts = ['Select Bank Account', 'Business Checking Account', 'Savings Account', 'Credit Line Account'];
const milestones = ['Select Milestone', 'Frontend Development Phase 1', 'Backend Development', 'Performance Optimization', 'Quality Assurance Testing', 'Deployment & Go-Live'];

// Mock data for items - yeh edit mode mein aayega
const mockItems = [
  { id: 1, milestone: 'Frontend Development Phase 1', price: 22000.00, discountPercent: 10, total: 19800.00 },
  { id: 2, milestone: 'Performance Optimization', price: 11000.00, discountPercent: 10, total: 9900.00 },
  { id: 3, milestone: 'Quality Assurance Testing', price: 13000.00, discountPercent: 1, total: 12870.00 },
];

export default function CreateProjectPaymentPage() {
  const [isEditMode, setIsEditMode] = useState(false); // For demo toggle
  const [formData, setFormData] = useState({
    paymentNumber: isEditMode ? 'PAY-00026' : '',
    paymentDate: isEditMode ? '2026-01-10' : new Date().toISOString().split('T')[0],
    dueDate: isEditMode ? '2026-01-28' : '',
    project: isEditMode ? 'Security Audit & Compliance' : '',
    customer: isEditMode ? 'Global Solutions Ltd' : '',
    bankAccount: isEditMode ? 'Business Checking Account' : '',
    paymentTerms: isEditMode ? 'Net 30' : '',
    notes: isEditMode ? 'Payment for security audit services' : '',
    subtotal: isEditMode ? 46000.00 : 0,
    discount: isEditMode ? 3430.00 : 0,
    total: isEditMode ? 42570.00 : 0,
    status: isEditMode ? 'Draft' : 'Draft'
  });

  const [items, setItems] = useState(isEditMode ? mockItems : [
    { id: 1, milestone: '', price: 0, discountPercent: 0, total: 0 }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), milestone: '', price: 0, discountPercent: 0, total: 0 }
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Calculate totals
  const calculateTotal = () => {
    let subtotal = 0;
    items.forEach(item => {
      const price = parseFloat(item.price.toString()) || 0;
      const discount = parseFloat(item.discountPercent.toString()) || 0;
      const total = price - (price * discount / 100);
      item.total = total;
      subtotal += total;
    });
    const discount = parseFloat(formData.discount.toString()) || 0;
    const finalTotal = subtotal - discount;
    return { subtotal, finalTotal };
  };

  const { subtotal, finalTotal } = calculateTotal();

  // Toggle edit mode for demo
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Project</span>
        <span className="text-gray-600">/</span>
        <span>Payments</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">{isEditMode ? 'Edit' : 'Create'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects/payments">
            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {isEditMode ? 'Edit Project Payment' : 'Create Project Payment'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isEditMode ? 'Update payment details' : 'Create a new project payment'}
            </p>
          </div>
        </div>
        {/* Demo toggle - remove in production */}
        <button 
          onClick={toggleEditMode}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition text-sm"
        >
          {isEditMode ? 'Switch to Create' : 'Switch to Edit'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-4xl mx-auto">
          <form className="space-y-6">
            {/* Payment Details */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Payment Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="paymentNumber"
                      placeholder="Auto-generated"
                      value={formData.paymentNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Posted">Posted</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Project <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FolderKanban className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {projects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Customer <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="customer"
                      value={formData.customer}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {customers.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bank Account <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Terms</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="paymentTerms"
                      placeholder="e.g., Net 30"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      name="notes"
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Items */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-green-400" />
                  Payment Items
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {/* Header Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-4 py-2 bg-gray-900 rounded-t-lg border border-gray-700 border-b-0">
                <div className="text-xs font-medium text-gray-400">Milestone <span className="text-red-400">*</span></div>
                <div className="text-xs font-medium text-gray-400">Price <span className="text-red-400">*</span></div>
                <div className="text-xs font-medium text-gray-400">Discount %</div>
                <div className="text-xs font-medium text-gray-400">Total</div>
                <div className="text-xs font-medium text-gray-400 text-right">Action</div>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 px-4 py-3 bg-gray-800 border border-gray-700 border-t-0 hover:bg-gray-700/50 transition">
                  <div>
                    <select
                      value={item.milestone}
                      onChange={(e) => handleItemChange(item.id, 'milestone', e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {milestones.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Payment Summary
              </h2>
              
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 max-w-md ml-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-{formatCurrency(parseFloat(formData.discount.toString()) || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400 font-medium">Total</span>
                    <span className="text-yellow-400 font-medium">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Count */}
            <div className="text-sm text-gray-400">
              {items.length} items added
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/projects/payments">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </Link>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}