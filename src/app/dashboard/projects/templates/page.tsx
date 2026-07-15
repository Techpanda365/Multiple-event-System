// app/dashboard/projects/templates/page.tsx
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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data
const initialTemplates = [
  { 
    id: 1,
    name: 'Customer Support Portal',
    users: 3,
    budget: 27000.00,
    startDate: '2025-09-27',
    endDate: '2026-06-06',
    status: 'Finished',
    description: 'Customer support portal template'
  },
  { 
    id: 2,
    name: 'Project Management Platform',
    users: 4,
    budget: 42000.00,
    startDate: '2025-09-24',
    endDate: '2026-04-25',
    status: 'Ongoing',
    description: 'Project management platform template'
  },
  { 
    id: 3,
    name: 'Fleet Management Solution',
    users: 2,
    budget: 41000.00,
    startDate: '2025-11-09',
    endDate: '2026-05-10',
    status: 'Ongoing',
    description: 'Fleet management solution template'
  },
  { 
    id: 4,
    name: 'Document Management System',
    users: 3,
    budget: 29000.00,
    startDate: '2025-09-17',
    endDate: '2026-05-08',
    status: 'Ongoing',
    description: 'Document management system template'
  },
  { 
    id: 5,
    name: 'Booking Management System',
    users: 2,
    budget: 34000.00,
    startDate: '2025-10-17',
    endDate: '2026-04-20',
    status: 'Ongoing',
    description: 'Booking management system template'
  },
  { 
    id: 6,
    name: 'Social Media Management Tool',
    users: 3,
    budget: 22000.00,
    startDate: '2025-08-18',
    endDate: '2026-05-23',
    status: 'Finished',
    description: 'Social media management tool template'
  },
  { 
    id: 7,
    name: 'Supply Chain Management',
    users: 4,
    budget: 52000.00,
    startDate: '2025-12-29',
    endDate: '2026-05-01',
    status: 'Onhold',
    description: 'Supply chain management template'
  },
  { 
    id: 8,
    name: 'Event Management Platform',
    users: 3,
    budget: 36000.00,
    startDate: '2025-12-18',
    endDate: '2026-05-20',
    status: 'Ongoing',
    description: 'Event management platform template'
  },
  { 
    id: 9,
    name: 'Real Estate Portal',
    users: 2,
    budget: 48000.00,
    startDate: '2025-11-09',
    endDate: '2026-04-11',
    status: 'Ongoing',
    description: 'Real estate portal template'
  },
  { 
    id: 10,
    name: 'Restaurant Management System',
    users: 3,
    budget: 26000.00,
    startDate: '2025-12-10',
    endDate: '2026-04-20',
    status: 'Finished',
    description: 'Restaurant management system template'
  },
];

const statusColors = {
  'Finished': 'bg-green-900/50 text-green-400 border border-green-800',
  'Ongoing': 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'Onhold': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  'Cancelled': 'bg-red-900/50 text-red-400 border border-red-800',
};

const statusIcons = {
  'Finished': CheckCircle,
  'Ongoing': Clock,
  'Onhold': AlertCircle,
  'Cancelled': XCircle,
};

export default function ProjectTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [convertFormData, setConvertFormData] = useState({ projectName: '' });
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  // ============ VIEW ============
  const handleView = (template: any) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  // ============ EDIT ============
  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditFormData({ ...template });
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
      setTemplates(prev =>
        prev.map(template =>
          template.id === editFormData.id
            ? { ...editFormData }
            : template
        )
      );
      setIsLoading(false);
      setShowEditModal(false);
      setSelectedTemplate(null);
      setEditFormData(null);
    }, 1000);
  };

  // ============ DELETE ============
  const handleDelete = (template: any) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedTemplate(null);
    }, 1000);
  };

  // ============ CONVERT TO PROJECT ============
  const handleConvert = (template: any) => {
    setSelectedTemplate(template);
    setConvertFormData({ projectName: template.name });
    setShowConvertModal(true);
  };

  const handleConvertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConvertFormData({
      ...convertFormData,
      [name]: value
    });
  };

  const handleConfirmConvert = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Convert template to project
      console.log('Converting template to project:', {
        template: selectedTemplate,
        projectName: convertFormData.projectName
      });
      setIsLoading(false);
      setShowConvertModal(false);
      setSelectedTemplate(null);
      // Redirect to projects page
      router.push('/dashboard/projects');
    }, 1500);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Project</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Templates</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Project Templates</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all project templates</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          {/* <Link href="/dashboard/projects/templates/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              Add Template
            </button>
          </Link> */}
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
                placeholder="Search templates..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Users</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentTemplates.map((template) => {
                const StatusIcon = statusIcons[template.status as keyof typeof statusIcons] || CheckCircle;
                return (
                  <tr key={template.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{template.name}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{template.users}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-yellow-400">
                      {formatCurrency(template.budget)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{template.startDate}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{template.endDate}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[template.status as keyof typeof statusColors]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {template.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(template)}
                          className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(template)}
                          className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleConvert(template)}
                          className="text-green-400 hover:text-green-300 transition p-1 hover:bg-green-900/20 rounded"
                          title="Convert to Project"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(template)}
                          className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
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

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} results
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

      {/* ============ VIEW MODAL ============ */}
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Template Details</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedTemplate(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[selectedTemplate.status as keyof typeof statusColors]}`}>
                      {selectedTemplate.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Users</label>
                    <p className="text-white">{selectedTemplate.users}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Budget</label>
                    <p className="text-yellow-400 font-medium">{formatCurrency(selectedTemplate.budget)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Start Date</label>
                    <p className="text-white">{selectedTemplate.startDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <p className="text-white">{selectedTemplate.endDate}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedTemplate(null); }}
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
                <h2 className="text-xl font-semibold text-white">Edit Template</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedTemplate(null); setEditFormData(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
                    <input
                      type="number"
                      name="budget"
                      value={editFormData.budget}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Users</label>
                    <input
                      type="number"
                      name="users"
                      value={editFormData.users}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={editFormData.startDate}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={editFormData.endDate}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Finished">Finished</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Onhold">Onhold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedTemplate(null); setEditFormData(null); }}
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

      {/* ============ DELETE MODAL ============ */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Template</h2>
              </div>
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this template?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedTemplate.name}</p>
                <p className="text-sm text-gray-400">Budget: {formatCurrency(selectedTemplate.budget)}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedTemplate(null); }}
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

      {/* ============ CONVERT TO PROJECT MODAL ============ */}
      {showConvertModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Convert to Project</h2>
                <button 
                  onClick={() => { setShowConvertModal(false); setSelectedTemplate(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="projectName"
                      value={convertFormData.projectName}
                      onChange={handleConvertChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                  <p className="text-sm text-gray-400">
                    This will create a new project with all team members, clients, tasks, bugs, and milestones from this template.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button 
                    onClick={() => { setShowConvertModal(false); setSelectedTemplate(null); }}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmConvert}
                    disabled={!convertFormData.projectName.trim() || isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Convert to Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}