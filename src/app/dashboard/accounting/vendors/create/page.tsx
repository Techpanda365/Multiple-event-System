// app/dashboard/accounting/vendors/create/page.tsx
'use client';

import { useState } from 'react';
import { 
  ChevronLeft,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Globe,
  Home,
  Tag,
  Calendar,
  DollarSign,
  MessageSquare,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  Truck,
  Users,
  ClipboardList,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function CreateVendorPage() {
  const [formData, setFormData] = useState({
    user: '',
    companyName: '',
    contactPerson: '',
    email: '',
    mobileNumber: '',
    taxNumber: '',
    paymentTerms: '',
    billingName: '',
    billingAddress: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingZip: '',
    shippingSameAsBilling: false,
    shippingName: '',
    shippingAddress: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingZip: '',
    notes: '',
    serviceDays: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accounting/vendors">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Vendor</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new vendor to your accounting system</p>
        </div>
      </div>

      {/* Single Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6">
          <form className="space-y-8">
            {/* Section: User */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <User className="w-5 h-5 inline mr-2" />
                User <span className="text-red-400">*</span>
              </h2>
              <div className="relative max-w-md">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select 
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">No User Selected</option>
                  <option value="alex">Alex Vendor</option>
                  <option value="sam">Sam Supplier</option>
                  <option value="tech">Tech Solutions Inc</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Create user here.</span>
                <Link href="/dashboard/users/create" className="text-xs text-blue-400 hover:text-blue-300">
                  Create user
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Note: Only users with vendor role who are not already assigned to other vendors will appear in this list.
              </p>
            </div>

            {/* Section: Company Details */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <Building2 className="w-5 h-5 inline mr-2" />
                Company Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Contact Person <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="mobileNumber"
                      placeholder="+1234567890"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: (country code)[phone number]</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tax Number</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="taxNumber"
                      placeholder="Enter tax number"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Terms</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              </div>
            </div>

            {/* Section: Billing Address */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <Home className="w-5 h-5 inline mr-2" />
                Billing Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Billing Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingName"
                    placeholder="Enter billing name"
                    value={formData.billingName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Billing Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    placeholder="Enter address"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="billingAddress2"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.billingAddress2}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingCity"
                    placeholder="Enter city"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingState"
                    placeholder="Enter state"
                    value={formData.billingState}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="billingCountry"
                      placeholder="Enter country"
                      value={formData.billingCountry}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Zip Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingZip"
                    placeholder="Enter zip code"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section: Shipping Address */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <Truck className="w-5 h-5 inline mr-2" />
                Shipping Address
              </h2>
              
              {/* Same as billing checkbox */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shippingSameAsBilling"
                    checked={formData.shippingSameAsBilling}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Shipping address same as billing</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Shipping Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingName"
                    placeholder="Enter shipping name"
                    value={formData.shippingName}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Shipping Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    placeholder="Enter shipping address"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="shippingAddress2"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.shippingAddress2}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    placeholder="Enter city"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingState"
                    placeholder="Enter state"
                    value={formData.shippingState}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="shippingCountry"
                      placeholder="Enter country"
                      value={formData.shippingCountry}
                      onChange={handleChange}
                      disabled={formData.shippingSameAsBilling}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Zip Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingZip"
                    placeholder="Enter zip code"
                    value={formData.shippingZip}
                    onChange={handleChange}
                    disabled={formData.shippingSameAsBilling}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Section: Additional Information */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <ClipboardList className="w-5 h-5 inline mr-2" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Enter notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Terms</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select payment terms</option>
                      <option value="net-15">Net 15</option>
                      <option value="net-30">Net 30</option>
                      <option value="net-45">Net 45</option>
                      <option value="net-60">Net 60</option>
                      <option value="cod">COD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Service Days</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="serviceDays"
                      placeholder="Enter service days"
                      value={formData.serviceDays}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/vendors">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </Link>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}