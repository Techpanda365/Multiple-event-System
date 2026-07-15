"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Upload, FileText, Image, Video, Music, Archive, Trash2, Eye, Download, MoreVertical, LayoutGrid, Columns, FolderPlus, UploadCloud, FileUp, ImageIcon, Loader2, X, ChevronRight, ChevronLeft } from "lucide-react";

type MediaFile = {
  id: string;
  name: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  alt: string | null;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return Image;
  if (mime.startsWith("video/")) return Video;
  if (mime.startsWith("audio/")) return Music;
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar")) return Archive;
  return FileText;
}

function getFileColor(mime: string): string {
  if (mime.startsWith("image/")) return "text-purple-400";
  if (mime.startsWith("video/")) return "text-blue-400";
  if (mime.startsWith("audio/")) return "text-green-400";
  if (mime.includes("pdf")) return "text-red-400";
  if (mime.includes("zip") || mime.includes("rar")) return "text-yellow-400";
  return "text-gray-400";
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Files");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [manualFolders, setManualFolders] = useState<string[]>([]);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const fileFolders = [...new Set(files.map((f) => f.folder))];
  const allFolders = [...new Set([...manualFolders, ...fileFolders])];
  const fileTypes = ["All Files", ...allFolders];

  const filteredFiles = files.filter(
    (file) =>
      (selectedFilter === "All Files" || file.folder === selectedFilter) &&
      (!searchTerm || file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalImages = files.filter((f) => f.mimeType.startsWith("image/")).length;
  const totalFolders = allFolders.length;

  const handleCreateFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    setManualFolders((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setUploadFolder(name);
    setFolderName("");
    setShowNewFolderModal(false);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsLoading(true);
    setError("");
    let success = 0;
    try {
      for (const file of uploadFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", uploadFolder);
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (res.ok) success++;
      }
      setUploadFiles([]);
      setShowUploadModal(false);
      fetchFiles();
    } catch {
      setError("Upload failed");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {}
  };

  const FolderIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  const HardDriveIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Media Library</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all your media files and documents</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNewFolderModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <FolderPlus className="w-4 h-4" /> New Folder
          </button>
          <button onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Files
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg"><FileText className="w-5 h-5 text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Media Library</p><p className="text-lg font-bold text-white">{totalFiles} Files</p></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg"><HardDriveIcon className="w-5 h-5 text-green-400" /></div>
            <div><p className="text-xs text-gray-400">Storage Used</p><p className="text-lg font-bold text-white">{formatSize(totalSize)}</p></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg"><ImageIcon className="w-5 h-5 text-purple-400" /></div>
            <div><p className="text-xs text-gray-400">Images</p><p className="text-lg font-bold text-white">{totalImages} Images</p></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg"><FolderIcon className="w-5 h-5 text-yellow-400" /></div>
            <div><p className="text-xs text-gray-400">Folders</p><p className="text-lg font-bold text-white">{totalFolders} Folders</p></div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search media files..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1 overflow-x-auto">
          {fileTypes.map((type) => (
            <button key={type} onClick={() => { setSelectedFilter(type); setCurrentPage(1); }}
              className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-lg transition ${selectedFilter === type ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg border border-gray-700 p-1">
          <button onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {allFolders.map((folder) => {
          const count = files.filter((f) => f.folder === folder).length;
          return (
            <div key={folder}
              onClick={() => { setSelectedFilter(folder); setCurrentPage(1); }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-500 transition cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-900/30 rounded-lg"><FolderIcon className="w-5 h-5 text-yellow-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition">{folder}</p>
                    <p className="text-xs text-gray-400">{count} files</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Files */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {loading ? "Loading..." : `${filteredFiles.length} files`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : currentFiles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No files found</p>
            <p className="text-sm">Upload files or create a folder</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentFiles.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                const isImage = file.mimeType.startsWith("image/");
                return (
                  <div key={file.id}
                    className="bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-500 transition cursor-pointer group relative overflow-hidden">
                    {isImage ? (
                      <div className="aspect-square bg-gray-800">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-gray-800">
                        <Icon className={`w-12 h-12 ${getFileColor(file.mimeType)}`} />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Preview</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Folder</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentFiles.map((file) => {
                  const Icon = getFileIcon(file.mimeType);
                  const isImage = file.mimeType.startsWith("image/");
                  return (
                    <tr key={file.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {isImage ? (
                          <img src={file.url} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <Icon className={`w-5 h-5 ${getFileColor(file.mimeType)}`} />
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap"><span className="text-sm text-white">{file.name}</span></td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{file.mimeType.split("/")[1]?.toUpperCase() || "FILE"}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{file.folder}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{formatSize(file.size)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{new Date(file.createdAt).toISOString().split("T")[0]}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <a href={file.url} target="_blank" className="text-gray-400 hover:text-white transition p-1"><Eye className="w-4 h-4" /></a>
                          <a href={file.url} download className="text-gray-400 hover:text-white transition p-1"><Download className="w-4 h-4" /></a>
                          <button onClick={() => handleDelete(file.id)} className="text-red-400 hover:text-red-300 transition p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFiles.length)} of {filteredFiles.length} files
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Previous</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Create New Folder</h2>
              <button onClick={() => { setShowNewFolderModal(false); setFolderName(""); }}
                className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Folder Name</label>
                <input type="text" placeholder="Enter folder name" value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowNewFolderModal(false); setFolderName(""); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleCreateFolder} disabled={!folderName.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upload Files</h2>
              <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }}
                className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Folder</label>
                <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {allFolders.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input type="file" ref={fileInputRef}
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                  multiple className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Click to select files or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">Supported: Images, Videos, Documents</p>
                </label>
              </div>
              {uploadFiles.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                      <span className="text-sm text-white truncate">{f.name}</span>
                      <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleUpload} disabled={uploadFiles.length === 0 || isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><UploadCloud className="w-4 h-4" /> Upload</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
