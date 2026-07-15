"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Upload, File, Image, Video, FileText, X, Plus, Loader2 } from "lucide-react";

type MediaItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: string;
  size?: string;
  date: string;
};

export default function AdminMediaLibrary() {
  const [userData, setUserData] = useState<{ name?: string; email?: string; image?: string; role?: string } | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const [sessionData, mediaData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/media-library").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setItems(mediaData.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/admin/media-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), type: "folder" }),
      });
      const data = await res.json();
      if (data.file) setItems((prev) => [...prev, data.file]);
    } catch (err) {
      console.error(err);
    }
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const fileType = file.type.startsWith("image/") ? "Image" : file.type.startsWith("video/") ? "Video" : "File";
      try {
        const res = await fetch("/api/admin/media-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: "file",
            fileType,
            size: (file.size / 1024).toFixed(1) + " KB",
          }),
        });
        const data = await res.json();
        if (data.file) setItems((prev) => [...prev, data.file]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getIcon = (item: MediaItem) => {
    if (item.type === "folder") return Folder;
    switch (item.fileType) {
      case "Image": return Image;
      case "Video": return Video;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Media Library" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Media Library" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Media Library</h2>
            <p className="text-muted-foreground text-sm">Upload and manage media files</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => setShowNewFolder(true)}>
              <Plus className="h-4 w-4" /> New Folder
            </Button>
            <Button className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
          </div>
        </div>

        {showNewFolder && (
          <div className="flex items-center gap-2 bg-card border rounded-lg p-3">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Folder name"
              className="h-8 flex-1"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFolder}>Create</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}><X className="h-4 w-4" /></Button>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileUpload(e.dataTransfer.files); }}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Folder className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">No files or folders yet</p>
            </div>
          ) : (
            items.map((item) => {
              const Icon = getIcon(item);
              return (
                <div key={item.id} className="bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer group">
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`h-10 w-10 ${item.type === "folder" ? "text-yellow-500" : "text-muted-foreground"}`} />
                    <p className="text-xs font-medium text-center truncate w-full">{item.name}</p>
                    {item.size && <p className="text-[11px] text-muted-foreground">{item.size}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
