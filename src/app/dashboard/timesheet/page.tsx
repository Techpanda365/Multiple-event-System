// app/dashboard/timesheet/page.tsx
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
  Clock,
  User,
  FileText,
  Download,
  Printer,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  FolderKanban,
  Tag,
  Hash,
  Timer,
  Briefcase,
  Clock3
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockTimesheets = [
  { 
    id: 1,
    name: 'Abby Beier',
    project: 'Cloud Migration Project',
    task: 'Encryption Implementation',
    type: 'Project',
    date: '2026-05-26',
    hours: 6,
    minutes: 15
  },
  { 
    id: 2,
    name: 'Claire Weissnat',
    project: '-',
    task: '-',
    type: 'Clock In/Out',
    date: '2026-05-25',
    hours: 8,
    minutes: 15
  },
  { 
    id: 3,
    name: 'Anthony Walker',
    project: '-',
    task: '-',
    type: 'Manual',
    date: '2026-05-22',
    hours: 6,
    minutes: 30
  },
  { 
    id: 4,
    name: 'John Smith',
    project: '-',
    task: '-',
    type: 'Clock In/Out',
    date: '2026-05-22',
    hours: 7,
    minutes: 45
  },
  { 
    id: 5,
    name: 'Sadye Swift',
    project: '-',
    task: '-',
    type: 'Clock In/Out',
    date: '2026-05-22',
    hours: 9,
    minutes: 15
  },
  { 
    id: 6,
    name: 'Michael Brown',
    project: '-',
    task: '-',
    type: 'Manual',
    date: '2026-05-21',
    hours: 3,
    minutes: 45
  },
  { 
    id: 7,
    name: 'Mrs. Tia Blick III',
    project: 'AI Chatbot Development',
    task: 'Unit Testing',
    type: 'Project',
    date: '2026-05-20',
    hours: 7,
    minutes: 15
  },
  { 
    id: 8,
    name: 'Delmer Gusikowski MD',
    project: 'Food Delivery Application',
    task: 'Data Synchronization',
    type: 'Project',
    date: '2026-05-20',
    hours: 5,
    minutes: 8
  },
  { 
    id: 9,
    name: 'James Garcia',
    project: '-',
    task: '-',
    type: 'Manual',
    date: '2026-05-13',
    hours: 7,
    minutes: 30
  },
  { 
    id: 10,
    name: 'Mrs. Tia Blick III',
    project: '-',
    task: '-',
    type: 'Clock In/Out',
    date: '2026-05-08',
    hours: 8,
    minutes: 30
  },
];

export default function TimesheetPage() {
  const [timesheets, setTimesheets] = useState(mockTimesheets);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Filter timesheets
  const filteredTimesheets = timesheets.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTimesheets = filteredTimesheets.slice(startIndex, startIndex + itemsPerPage);

  // ============ VIEW ============
  const handleView = (item: any) => {
    setSelectedTimesheet(item);
    setShowViewModal(true);
  };

  // ============ EDIT ============
  const handleEdit = (item: any) => {
    setSelectedTimesheet(item);
    setEditFormData({ ...item });
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
      setTimesheets(prev =>
        prev.map(item =>
          item.id === editFormData.id
            ? { ...editFormData }
            : item
        )
      );
      setIsLoading(false);
      setShowEditModal(false);
      setSelectedTimesheet(null);
      setEditFormData(null);
    }, 1000);
  };

  // ============ DELETE ============
  const handleDelete = (item: any) => {
    setSelectedTimesheet(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTimesheets(prev => prev.filter(item => item.id !== selectedTimesheet.id));
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedTimesheet(null);
    }, 1000);
  };

  // ============ EXPORT ============
  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      const headers = ['Name', 'Project', 'Task', 'Type', 'Date', 'Hours', 'Minutes'];
      const rows = filteredTimesheets.map(item => [
        item.name, item.project, item.task, item.type, 
        item.date, item.hours, item.minutes
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsLoading(false);
    }, 1500);
  };

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Timesheet</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Timesheet</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all timesheet entries</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
          <Link href="/dashboard/timesheet/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              Add Timesheet
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search timesheets..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Hours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Minutes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentTimesheets.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{item.project}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{item.task}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{item.type}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{item.date}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-white">{item.hours.toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-white">{item.minutes.toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleView(item)}
                        className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTimesheets.length)} of {filteredTimesheets.length} results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
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
      {showViewModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Timesheet Details</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedTimesheet(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <p className="text-white">{selectedTimesheet.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Project</label>
                  <p className="text-white">{selectedTimesheet.project}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Task</label>
                  <p className="text-white">{selectedTimesheet.task}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Type</label>
                  <p className="text-white">{selectedTimesheet.type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-white">{selectedTimesheet.date}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Hours</label>
                    <p className="text-white">{selectedTimesheet.hours}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Minutes</label>
                    <p className="text-white">{selectedTimesheet.minutes}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedTimesheet(null); }}
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
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Timesheet</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedTimesheet(null); setEditFormData(null); }}
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                  <input
                    type="text"
                    name="project"
                    value={editFormData.project}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Task</label>
                  <input
                    type="text"
                    name="task"
                    value={editFormData.task}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Hours</label>
                    <input
                      type="number"
                      name="hours"
                      value={editFormData.hours}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Minutes</label>
                    <input
                      type="number"
                      name="minutes"
                      value={editFormData.minutes}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedTimesheet(null); setEditFormData(null); }}
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
      {showDeleteModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Timesheet</h2>
              </div>
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this timesheet?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedTimesheet.name}</p>
                <p className="text-sm text-gray-400">{selectedTimesheet.date}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedTimesheet(null); }}
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