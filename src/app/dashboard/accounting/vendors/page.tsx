// app/dashboard/accounting/vendors/page.tsx
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
  Users,
  Mail,
  Building2,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const vendors = [
  { 
    id: 1, 
    vendorCode: 'VEN-0001', 
    companyName: 'Jacobi and Sons', 
    contactPerson: 'Sandy Christiansen',
    email: 'sschroeder@shields.com',
    taxNumber: 'TAX-27598912',
    user: 'Alex Vendor'
  },
  { 
    id: 2, 
    vendorCode: 'VEN-0002', 
    companyName: 'Veum-Streich', 
    contactPerson: 'Liam Rodriguez',
    email: 'laisha.moscicki@borer.com',
    taxNumber: 'TAX-67973420',
    user: 'Sam Supplier'
  },
  { 
    id: 3, 
    vendorCode: 'VEN-0003', 
    companyName: 'Herzog-Kihn', 
    contactPerson: 'Caleb Grimes',
    email: 'thegmann@wilkinson.org',
    taxNumber: 'TAX-38297196',
    user: 'Tech Solutions Inc'
  },
  { 
    id: 4, 
    vendorCode: 'VEN-0004', 
    companyName: 'Herman-Bernhard', 
    contactPerson: 'Prof. Jaclyn Klein',
    email: 'johnathon.weissnat@gislason.com',
    taxNumber: 'TAX-68410314',
    user: 'Global Supplies Co'
  },
  { 
    id: 5, 
    vendorCode: 'VEN-0005', 
    companyName: 'Ratke Group', 
    contactPerson: 'Jorge Satterfield',
    email: 'darrell.erdman@weissnat.com',
    taxNumber: 'TAX-28973024',
    user: 'Prime Materials Ltd'
  },
  { 
    id: 6, 
    vendorCode: 'VEN-0006', 
    companyName: 'Will Group', 
    contactPerson: 'Rhett Toy',
    email: 'syble33@rowe.com',
    taxNumber: 'TAX-93656327',
    user: 'Elite Vendors Group'
  },
  { 
    id: 7, 
    vendorCode: 'VEN-0007', 
    companyName: 'Bechtler-Halvorson', 
    contactPerson: 'Felicia Turcotte V',
    email: 'walker.felton@wehner.com',
    taxNumber: 'TAX-84415695',
    user: 'Quality Parts Corp'
  },
  { 
    id: 8, 
    vendorCode: 'VEN-0008', 
    companyName: 'Mohr LLC', 
    contactPerson: 'Ruby Kling',
    email: 'bianka.schultz@bergnaum.net',
    taxNumber: 'TAX-45749271',
    user: 'Swift Logistics'
  },
  { 
    id: 9, 
    vendorCode: 'VEN-0009', 
    companyName: 'Hahn LLC', 
    contactPerson: 'Kayleigh Stroman',
    email: 'pledner@bazhiran.biz',
    taxNumber: 'TAX-20012565',
    user: 'Mega Distributors'
  },
  { 
    id: 10, 
    vendorCode: 'VEN-0010', 
    companyName: 'Beer, Bradtke and Denesik', 
    contactPerson: 'Prof. Jensen Wintheiser',
    email: 'edwina37@wolf.info',
    taxNumber: 'TAX-83297571',
    user: 'Pro Equipment Ltd'
  },
];

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredVendors = vendors.filter(vendor =>
    vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Accounting</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Vendors</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your vendor database</p>
        </div>
        <Link href="/dashboard/accounting/vendors/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vendors..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('vendorCode')}>
                  <div className="flex items-center gap-1">
                    Vendor Code <SortIcon field="vendorCode" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-1">
                    Company Name <SortIcon field="companyName" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('contactPerson')}>
                  <div className="flex items-center gap-1">
                    Contact Person <SortIcon field="contactPerson" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">
                    Email <SortIcon field="email" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('taxNumber')}>
                  <div className="flex items-center gap-1">
                    Tax Number <SortIcon field="taxNumber" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-white">{vendor.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{vendor.vendorCode}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-white">{vendor.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{vendor.contactPerson}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">{vendor.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                      {vendor.taxNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-500 hover:text-gray-400 transition">
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of {filteredVendors.length} results
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
    </div>
  );
}