"use client";

import { useState, useEffect } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/workspaces").then(r => r.json()).then(d => d.workspaces || []),
      fetch("/api/admin/workspaces/current").then(r => r.json()),
    ]).then(([list, cur]) => {
      setWorkspaces(list);
      setCurrent(cur.workspace || null);
    });
  }, []);

  const select = async (ws: Workspace | null) => {
    setOpen(false);
    await fetch("/api/admin/workspaces/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: ws?.id || null }),
    });
    window.location.reload();
  };

  return (
    <div className="relative border-b border-white/10 px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-sidebar-foreground/50" />
        <span className="flex-1 text-left truncate">
          {current ? current.name : "All Workspaces"}
        </span>
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-sidebar-foreground/40" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-md border border-white/10 bg-sidebar py-1 shadow-lg">
            <button
              onClick={() => select(null)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-white/5 transition-colors"
            >
              <div className="w-3.5 flex-shrink-0">
                {!current && <Check className="h-3 w-3 text-primary" />}
              </div>
              <span>All Workspaces</span>
            </button>
            <div className="mx-2 border-t border-white/10 my-1" />
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => select(ws)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-white/5 transition-colors"
              >
                <div className="w-3.5 flex-shrink-0">
                  {current?.id === ws.id && <Check className="h-3 w-3 text-primary" />}
                </div>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
