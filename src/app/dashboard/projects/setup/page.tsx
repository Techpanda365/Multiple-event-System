// app/dashboard/projects/setup/page.tsx
'use client';

import { useState } from 'react';
import { 
  ChevronLeft,
  Settings,
  ListChecks,
  Bug,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Search,
  Filter,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Tag,
  Palette,
  FolderKanban
} from 'lucide-react';
import Link from 'next/link';

// ✅ Initial data - State mein rakhna hai
const initialTaskStages = [
  { id: 1, name: 'Todo', color: 'Red' },
  { id: 2, name: 'In Progress', color: 'Blue' },
  { id: 3, name: 'Review', color: 'Yellow' },
  { id: 4, name: 'Done', color: 'Green' },
];

const initialBugStages = [
  { id: 1, name: 'New', color: 'Red' },
  { id: 2, name: 'In Progress', color: 'Blue' },
  { id: 3, name: 'Resolved', color: 'Green' },
  { id: 4, name: 'Closed', color: 'Gray' },
];

const colorMap: Record<string, string> = {
  'Red': 'bg-red-500',
  'Blue': 'bg-blue-500',
  'Green': 'bg-green-500',
  'Yellow': 'bg-yellow-500',
  'Purple': 'bg-purple-500',
  'Orange': 'bg-orange-500',
  'Pink': 'bg-pink-500',
  'Gray': 'bg-gray-500',
  'Cyan': 'bg-cyan-500',
  'Teal': 'bg-teal-500',
};

const colorTextMap: Record<string, string> = {
  'Red': 'text-red-400',
  'Blue': 'text-blue-400',
  'Green': 'text-green-400',
  'Yellow': 'text-yellow-400',
  'Purple': 'text-purple-400',
  'Orange': 'text-orange-400',
  'Pink': 'text-pink-400',
  'Gray': 'text-gray-400',
  'Cyan': 'text-cyan-400',
  'Teal': 'text-teal-400',
};

export default function SystemSetupPage() {
  // ✅ State mein rakho
  const [taskStages, setTaskStages] = useState(initialTaskStages);
  const [bugStages, setBugStages] = useState(initialBugStages);
  const [activeTab, setActiveTab] = useState<'task' | 'bug'>('task');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [createFormData, setCreateFormData] = useState({ name: '', color: 'Red' });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Current stages based on active tab
  const currentStages = activeTab === 'task' ? taskStages : bugStages;
  const setCurrentStages = activeTab === 'task' ? setTaskStages : setBugStages;

  const filteredStages = currentStages.filter(stage =>
    stage.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Gray', 'Cyan', 'Teal'];

  // ============ CREATE ============
  const handleCreate = () => {
    setCreateFormData({ name: '', color: 'Red' });
    setShowCreateModal(true);
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: value
    });
  };

  const handleCreateSubmit = () => {
    if (!createFormData.name.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        name: createFormData.name.trim(),
        color: createFormData.color,
      };
      setCurrentStages([...currentStages, newItem]);
      setIsLoading(false);
      setShowCreateModal(false);
      setCreateFormData({ name: '', color: 'Red' });
    }, 500);
  };

  // ============ EDIT ============
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setEditFormData({ ...item });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSaveEdit = () => {
    if (!editFormData.name.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStages(
        currentStages.map(item =>
          item.id === editFormData.id
            ? { ...editFormData }
            : item
        )
      );
      setIsLoading(false);
      setShowEditModal(false);
      setSelectedItem(null);
      setEditFormData(null);
    }, 500);
  };

  // ============ DELETE ============
  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStages(currentStages.filter(item => item.id !== selectedItem.id));
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedItem(null);
    }, 500);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span>Project</span>
        <span className="text-gray-600">/</span>
        <span>System Setup</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Task Stage</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Setup</h1>
          <p className="text-sm text-gray-400 mt-1">Manage task and bug stages</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('task')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'task'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Task Stage
        </button>
        <button
          onClick={() => setActiveTab('bug')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'bug'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Bug className="w-4 h-4" />
          Bug Stage
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'task' ? 'task' : 'bug'} stages...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Stages List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Color</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredStages.map((stage) => (
                <tr key={stage.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-white">{stage.name}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${colorMap[stage.color] || 'bg-gray-500'}`} />
                      <span className={`text-sm ${colorTextMap[stage.color] || 'text-gray-400'}`}>{stage.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(stage)}
                        className="text-yellow-400 hover:text-yellow-300 transition p-1 hover:bg-yellow-900/20 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(stage)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ CREATE MODAL ============ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Create {activeTab === 'task' ? 'Task' : 'Bug'} Stage
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      placeholder={`Enter ${activeTab === 'task' ? 'task' : 'bug'} stage name`}
                      value={createFormData.name}
                      onChange={handleCreateChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="color"
                      value={createFormData.color}
                      onChange={handleCreateChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {colors.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateSubmit}
                    disabled={!createFormData.name.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                </div>
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
                <h2 className="text-xl font-semibold text-white">
                  Edit {activeTab === 'task' ? 'Task' : 'Bug'} Stage
                </h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }}
                  className="p-1 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="color"
                      value={editFormData.color}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {colors.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button 
                    onClick={() => { setShowEditModal(false); setSelectedItem(null); setEditFormData(null); }}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={!editFormData.name.trim() || isLoading}
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
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Stage</h2>
              </div>
              
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this stage?
              </p>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-400">Color: {selectedItem.color}</p>
              </div>
              <p className="text-sm text-red-400">This action cannot be undone.</p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }}
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