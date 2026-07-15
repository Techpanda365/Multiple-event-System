// app/dashboard/projects/report/page.tsx
'use client';

import { useState } from 'react';
import { 
  Search,
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
  FolderKanban,
  BarChart3,
  Target,
  FileText,
  Building2,
  Package,
  Box,
  GitBranch,
  ListChecks,
  FileDown,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const reports = [
  { 
    id: 1,
    name: 'Customer Support Portal',
    startDate: '2025-09-27',
    endDate: '2026-06-06',
    members: 2,
    tasksDone: 3,
    tasksTotal: 10,
    milestonesDone: 8,
    milestonesTotal: 24,
    bugsDone: 2,
    bugsTotal: 5,
    budget: 27000.00,
    collected: 0,
    status: 'Finished'
  },
  { 
    id: 2,
    name: 'Blockchain Payment Gateway',
    startDate: '2025-01-30',
    endDate: '2026-05-10',
    members: 2,
    tasksDone: 1,
    tasksTotal: 9,
    milestonesDone: 1,
    milestonesTotal: 4,
    bugsDone: 0,
    bugsTotal: 0,
    budget: 80000.00,
    collected: 15895.00,
    status: 'Onhold'
  },
  { 
    id: 3,
    name: 'Virtual Event Platform',
    startDate: '2026-01-20',
    endDate: '2026-04-20',
    members: 2,
    tasksDone: 3,
    tasksTotal: 7,
    milestonesDone: 1,
    milestonesTotal: 3,
    bugsDone: 0,
    bugsTotal: 0,
    budget: 46000.00,
    collected: 0,
    status: 'Ongoing'
  },
  { 
    id: 4,
    name: 'Warehouse Automation System',
    startDate: '2026-01-15',
    endDate: '2026-04-25',
    members: 3,
    tasksDone: 1,
    tasksTotal: 5,
    milestonesDone: 1,
    milestonesTotal: 3,
    bugsDone: 0,
    bugsTotal: 0,
    budget: 70000.00,
    collected: 20850.00,
    status: 'Onhold'
  },
  { 
    id: 5,
    name: 'Cloud Migration Project',
    startDate: '2026-01-10',
    endDate: '2026-05-10',
    members: 2,
    tasksDone: 3,
    tasksTotal: 7,
    milestonesDone: 1,
    milestonesTotal: 3,
    bugsDone: 0,
    bugsTotal: 0,
    budget: 60000.00,
    collected: 43520.00,
    status: 'Onhold'
  },
  { 
    id: 6,
    name: 'Data Analytics Dashboard',
    startDate: '2025-11-21',
    endDate: '2026-03-26',
    members: 3,
    tasksDone: 4,
    tasksTotal: 7,
    milestonesDone: 2,
    milestonesTotal: 4,
    bugsDone: 1,
    bugsTotal: 4,
    budget: 35000.00,
    collected: 12000.00,
    status: 'Onhold'
  },
  { 
    id: 7,
    name: 'Smart IoT Home Automation',
    startDate: '2025-12-31',
    endDate: '2026-04-30',
    members: 2,
    tasksDone: 5,
    tasksTotal: 10,
    milestonesDone: 2,
    milestonesTotal: 5,
    bugsDone: 0,
    bugsTotal: 0,
    budget: 55000.00,
    collected: 18000.00,
    status: 'Onhold'
  },
  { 
    id: 8,
    name: 'Customer Feedback Portal',
    startDate: '2025-12-21',
    endDate: '2026-03-16',
    members: 2,
    tasksDone: 5,
    tasksTotal: 6,
    milestonesDone: 3,
    milestonesTotal: 4,
    bugsDone: 0,
    bugsTotal: 3,
    budget: 28000.00,
    collected: 9500.00,
    status: 'Onhold'
  },
  { 
    id: 9,
    name: 'Security Audit & Compliance',
    startDate: '2025-12-16',
    endDate: '2026-03-11',
    members: 2,
    tasksDone: 7,
    tasksTotal: 7,
    milestonesDone: 3,
    milestonesTotal: 3,
    bugsDone: 2,
    bugsTotal: 4,
    budget: 32000.00,
    collected: 15000.00,
    status: 'Onhold'
  },
  { 
    id: 10,
    name: 'Online Ticket Booking System',
    startDate: '2025-12-16',
    endDate: '2026-03-11',
    members: 3,
    tasksDone: 8,
    tasksTotal: 9,
    milestonesDone: 4,
    milestonesTotal: 5,
    bugsDone: 2,
    bugsTotal: 4,
    budget: 45000.00,
    collected: 22000.00,
    status: 'Onhold'
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

export default function ProjectReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary stats
  const totalProjects = reports.length;
  const ongoing = reports.filter(r => r.status === 'Ongoing').length;
  const onHold = reports.filter(r => r.status === 'Onhold').length;
  const finished = reports.filter(r => r.status === 'Finished').length;
  const overdue = 15;
  const totalBudget = reports.reduce((sum, r) => sum + r.budget, 0);
  const totalCollected = reports.reduce((sum, r) => sum + r.collected, 0);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Project</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Report</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Project Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Overview of all project reports</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Total Projects</p>
          <p className="text-xl font-bold text-white">{totalProjects}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Ongoing</p>
          <p className="text-xl font-bold text-blue-400">{ongoing}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">On Hold</p>
          <p className="text-xl font-bold text-yellow-400">{onHold}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Finished</p>
          <p className="text-xl font-bold text-green-400">{finished}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Overdue</p>
          <p className="text-xl font-bold text-red-400">{overdue}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Total Budget</p>
          <p className="text-sm font-bold text-yellow-400">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 text-center">
          <p className="text-xs text-gray-400">Total Collected</p>
          <p className="text-sm font-bold text-green-400">{formatCurrency(totalCollected)}</p>
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
                placeholder="Search projects..."
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

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentReports.map((report) => {
          const StatusIcon = statusIcons[report.status as keyof typeof statusIcons] || Clock;
          const tasksPercent = Math.round((report.tasksDone / report.tasksTotal) * 100) || 0;
          const milestonesPercent = Math.round((report.milestonesDone / report.milestonesTotal) * 100) || 0;
          const bugsPercent = report.bugsTotal > 0 ? Math.round((report.bugsDone / report.bugsTotal) * 100) : 0;
          const collectedPercent = report.budget > 0 ? Math.round((report.collected / report.budget) * 100) : 0;

          return (
            <div key={report.id} className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-500 transition p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-white">{report.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <span>Start: {report.startDate}</span>
                    <span className="text-gray-600">|</span>
                    <span>End: {report.endDate}</span>
                    <span className="text-gray-600">|</span>
                    <Users className="w-4 h-4" />
                    <span>{report.members} members</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColors[report.status as keyof typeof statusColors]}`}>
                  <StatusIcon className="w-3 h-3" />
                  {report.status}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Tasks</p>
                  <p className="text-sm text-white">{report.tasksDone}/{report.tasksTotal} ({tasksPercent}%)</p>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${tasksPercent}%` }} />
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Milestones</p>
                  <p className="text-sm text-white">{report.milestonesDone}/{report.milestonesTotal} ({milestonesPercent}%)</p>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-purple-500 rounded-full h-1.5" style={{ width: `${milestonesPercent}%` }} />
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bugs</p>
                  <p className="text-sm text-white">{report.bugsDone}/{report.bugsTotal} ({bugsPercent}%)</p>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-red-500 rounded-full h-1.5" style={{ width: `${bugsPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Budget & Collected */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-medium text-yellow-400">{formatCurrency(report.budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Collected</p>
                  <p className="text-sm font-medium text-green-400">{formatCurrency(report.collected)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Used</p>
                  <p className="text-sm font-medium text-white">{collectedPercent}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} results
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
  );
}