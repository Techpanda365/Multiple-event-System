// app/dashboard/helpdesk/page.tsx
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
  Tag,
  Hash,
  User,
  MessageSquare,
  Download,
  Printer
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const tickets = [
  { 
    id: 1,
    ticketId: '#12345011',
    title: 'Email Notifications Not Received',
    category: 'Technical Support',
    priority: 'Medium',
    status: 'Open',
    createdBy: 'Company',
  },
  { 
    id: 2,
    ticketId: '#12345014',
    title: 'User Permission Management',
    category: 'Technical Support',
    priority: 'Low',
    status: 'Closed',
    createdBy: 'Company',
  },
  { 
    id: 3,
    ticketId: '#12345004',
    title: 'Data Export Not Working',
    category: 'Technical Support',
    priority: 'Medium',
    status: 'Resolved',
    createdBy: 'Company',
  },
  { 
    id: 4,
    ticketId: '#12345007',
    title: 'Mobile App Crashes on Startup',
    category: 'Technical Support',
    priority: 'High',
    status: 'In progress',
    createdBy: 'Company',
  },
  { 
    id: 5,
    ticketId: '#12345008',
    title: 'Subscription Upgrade Request',
    category: 'Technical Support',
    priority: 'Low',
    status: 'Resolved',
    createdBy: 'Company',
  },
  { 
    id: 6,
    ticketId: '#12345003',
    title: 'Feature Request: Dark Mode',
    category: 'Technical Support',
    priority: 'Low',
    status: 'Open',
    createdBy: 'Company',
  },
  { 
    id: 7,
    ticketId: '#12345010',
    title: 'File Upload Size Limit',
    category: 'Technical Support',
    priority: 'Medium',
    status: 'In progress',
    createdBy: 'Company',
  },
  { 
    id: 8,
    ticketId: '#12345006',
    title: 'Password Reset Not Working',
    category: 'Technical Support',
    priority: 'Medium',
    status: 'Open',
    createdBy: 'Company',
  },
  { 
    id: 9,
    ticketId: '#12345005',
    title: 'Account Suspension Appeal',
    category: 'Technical Support',
    priority: 'High',
    status: 'Closed',
    createdBy: 'Company',
  },
  { 
    id: 10,
    ticketId: '#12345001',
    title: 'Login Issues with Two-Factor Authentication',
    category: 'Technical Support',
    priority: 'High',
    status: 'Open',
    createdBy: 'Company',
  },
];

const priorityColors = {
  High: 'text-red-400 bg-red-900/30 border border-red-800',
  Medium: 'text-yellow-400 bg-yellow-900/30 border border-yellow-800',
  Low: 'text-green-400 bg-green-900/30 border border-green-800',
};

const statusColors = {
  Open: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  'In progress': 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  Resolved: 'bg-green-900/50 text-green-400 border border-green-800',
  Closed: 'bg-gray-700 text-gray-400 border border-gray-600',
};

const statusIcons = {
  Open: AlertCircle,
  'In progress': Clock,
  Resolved: CheckCircle,
  Closed: XCircle,
};

export default function HelpDeskPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

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
        <span>Helpdesk</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">All Tickets</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Tickets</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all support tickets</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link href="/dashboard/help-desk/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              New Ticket
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
                placeholder="Search tickets..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('ticketId')}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Ticket ID <SortIcon field="ticketId" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Title <SortIcon field="title" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Category <SortIcon field="category" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                  Priority <SortIcon field="priority" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('createdBy')}>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Created By <SortIcon field="createdBy" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentTickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
                return (
                  <tr key={ticket.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-400">{ticket.ticketId}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{ticket.title}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{ticket.createdBy}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-900/20 rounded" title="View Ticket">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded" title="Edit Ticket">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-900/20 rounded" title="Delete Ticket">
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTickets.length)} of {filteredTickets.length} results
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
    </div>
  );
}