"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ImageIcon, Loader2, Check } from "lucide-react";

type MediaFile = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  folder: string;
};

interface MediaLibraryPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  selectedUrls?: string[];
}

export function MediaLibraryPicker({ open, onClose, onSelect, multiple, selectedUrls = [] }: MediaLibraryPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedUrls);

  const filtered = files.filter(
    (f) => !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFiles(Array.isArray(data) ? data.filter((f: MediaFile) => f.mimeType?.startsWith("image/")) : []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [open]);

  const toggle = (url: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelected([url]);
    }
  };

  const handleDone = () => {
    if (selected.length > 0) {
      onSelect(selected);
    }
    setSelected([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Media Library</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No images found in media library</p>
              <p className="text-sm">Upload images from the Media section first</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {filtered.map((file) => {
                const isSelected = selected.includes(file.url);
                return (
                  <button
                    key={file.id}
                    onClick={() => toggle(file.url)}
                    className={`relative aspect-square rounded-lg border overflow-hidden group cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                      <p className="text-[10px] text-white truncate">{file.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selected.length > 0 ? `${selected.length} selected` : "No selection"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleDone} disabled={selected.length === 0}>
              {multiple ? `Add (${selected.length})` : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
