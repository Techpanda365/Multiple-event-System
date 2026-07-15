"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, ArrowLeftRight, X, Save, AlertCircle, Loader2, User, CheckCircle, RefreshCw, Clock, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";

type Assignment = {
  id: string;
  assetName: string;
  assignedTo: string;
  assignedDate: string;
  expectedReturn: string | null;
  actualReturn: string | null;
  status: string;
  condition: string;
  returnCondition: string | null;
  returnNotes: string | null;
  notes: string | null;
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

const statusColors: Record<string, string> = {
  Active: "bg-green-900/50 text-green-400 border-green-800",
  Returned: "bg-blue-900/50 text-blue-400 border-blue-800",
  Overdue: "bg-red-900/50 text-red-400 border-red-800",
};
const statusIcons: Record<string, React.ReactNode> = {
  Active: <CheckCircle className="w-3 h-3" />,
  Returned: <RefreshCw className="w-3 h-3" />,
  Overdue: <AlertCircle className="w-3 h-3" />,
};
const conditionColors: Record<string, string> = {
  Excellent: "bg-green-900/50 text-green-400 border-green-800",
  Good: "bg-blue-900/50 text-blue-400 border-blue-800",
  Fair: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
  Poor: "bg-red-900/50 text-red-400 border-red-800",
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [viewItem, setViewItem] = useState<Assignment | null>(null);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [returnItem, setReturnItem] = useState<Assignment | null>(null);
  const [returnForm, setReturnForm] = useState({ returnDate: "", condition: "", returnNotes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/assets/assignments")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setAssignments(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignments.filter((a) => a.assetName.toLowerCase().includes(q) || a.assignedTo.toLowerCase().includes(q));
  }, [assignments, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const callApi = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/assets/assignments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  };

  async function handleSaveEdit() {
    if (!editItem) return;
    setSaving(true);
    try {
      const updated = await callApi(editItem.id, {
        assetName: editForm.assetName, assignedTo: editForm.assignedTo,
        assignedDate: editForm.assignedDate, expectedReturn: editForm.expectedReturn || null,
        status: editForm.status, condition: editForm.condition,
      });
      setAssignments((prev) => prev.map((a) => a.id === editItem.id ? { ...a, ...updated } : a));
      setEditItem(null);
    } catch { alert("Failed to update"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/assets/assignments/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setAssignments((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch { alert("Failed to delete"); }
    finally { setSaving(false); }
  }

  async function handleReturn() {
    if (!returnItem) return;
    setSaving(true);
    try {
      const updated = await callApi(returnItem.id, {
        status: "Returned", actualReturn: returnForm.returnDate,
        returnCondition: returnForm.condition, returnNotes: returnForm.returnNotes || null,
      });
      setAssignments((prev) => prev.map((a) => a.id === returnItem.id ? { ...a, ...updated } : a));
      setReturnItem(null);
    } catch { alert("Failed to return"); }
    finally { setSaving(false); }
  }

  const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${className || ""}`}>{children}</span>
  );

  return (
    <DashboardLayout title="Assignments">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Manage Assignments</h1><p className="text-sm text-muted-foreground">Manage asset assignments</p></div>
          <div className="flex gap-2">
            <Link href="/dashboard/assets/assignments/create"><Plus className="h-4 w-4 mr-1 inline" /> New Assignment</Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by asset name..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10 per page</option><option value={25}>25 per page</option><option value={50}>50 per page</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Asset</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Assigned To</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Assigned Date</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Expected Return</th>
                  <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Status</th>
                  <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Condition</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No assignments found</td></tr>
                ) : paginated.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/5">
                    <td className="p-3 font-medium">{a.assetName}</td>
                    <td className="p-3"><span className="text-muted-foreground">{a.assignedTo}</span></td>
                    <td className="p-3 text-muted-foreground">{formatDate(a.assignedDate)}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(a.expectedReturn)}</td>
                    <td className="p-3 text-center"><Badge className={statusColors[a.status] || ""}>{statusIcons[a.status]}{a.status}</Badge></td>
                    <td className="p-3 text-center"><Badge className={conditionColors[a.condition] || ""}>{a.condition}</Badge></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewItem(a)} className="p-1.5 hover:bg-muted rounded" title="View"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => { setEditItem(a); setEditForm({ assetName: a.assetName, assignedTo: a.assignedTo, assignedDate: a.assignedDate, expectedReturn: a.expectedReturn || "", status: a.status, condition: a.condition }); }} className="p-1.5 hover:bg-muted rounded" title="Edit"><Edit className="h-4 w-4" /></button>
                        {a.status === "Active" && (
                          <button onClick={() => { setReturnItem(a); setReturnForm({ returnDate: new Date().toISOString().split("T")[0], condition: a.condition, returnNotes: "" }); }} className="p-1.5 hover:bg-muted rounded text-green-600" title="Return"><ArrowLeftRight className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => setDeleteId(a.id)} className="p-1.5 hover:bg-muted rounded text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-3 border-t">
              <span className="text-sm text-muted-foreground">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewItem(null)}>
            <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Assignment Details</h2>
                <button onClick={() => setViewItem(null)}><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-muted-foreground">Asset</span><p className="font-medium">{viewItem.assetName}</p></div>
                  <div><span className="text-muted-foreground">Assigned To</span><p className="font-medium">{viewItem.assignedTo}</p></div>
                  <div><span className="text-muted-foreground">Assigned Date</span><p>{formatDate(viewItem.assignedDate)}</p></div>
                  <div><span className="text-muted-foreground">Expected Return</span><p>{formatDate(viewItem.expectedReturn)}</p></div>
                  <div><span className="text-muted-foreground">Status</span><p><Badge className={statusColors[viewItem.status] || ""}>{viewItem.status}</Badge></p></div>
                  <div><span className="text-muted-foreground">Condition</span><p><Badge className={conditionColors[viewItem.condition] || ""}>{viewItem.condition}</Badge></p></div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t"><button onClick={() => setViewItem(null)} className="px-4 py-2 border rounded text-sm">Close</button></div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditItem(null)}>
            <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Assignment</h2>
                <button onClick={() => setEditItem(null)}><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div><label className="text-sm font-medium">Asset</label><input type="text" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.assetName} onChange={(e) => setEditForm((f) => ({ ...f, assetName: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Assigned To</label><input type="text" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.assignedTo} onChange={(e) => setEditForm((f) => ({ ...f, assignedTo: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Assigned Date</label><input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.assignedDate} onChange={(e) => setEditForm((f) => ({ ...f, assignedDate: e.target.value }))} /></div>
                  <div><label className="text-sm font-medium">Expected Return</label><input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.expectedReturn} onChange={(e) => setEditForm((f) => ({ ...f, expectedReturn: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Status</label>
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                      <option value="Active">Active</option><option value="Returned">Returned</option><option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div><label className="text-sm font-medium">Condition</label>
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={editForm.condition} onChange={(e) => setEditForm((f) => ({ ...f, condition: e.target.value }))}>
                      <option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <button onClick={() => setEditItem(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm flex items-center gap-2">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}</button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {returnItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setReturnItem(null)}>
            <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Return Asset</h2>
                <button onClick={() => setReturnItem(null)}><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="bg-muted/20 rounded-lg p-3 grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Asset</span><p className="font-medium">{returnItem.assetName}</p></div>
                  <div><span className="text-muted-foreground">Assigned To</span><p>{returnItem.assignedTo}</p></div>
                  <div><span className="text-muted-foreground">Assigned Date</span><p>{formatDate(returnItem.assignedDate)}</p></div>
                  <div><span className="text-muted-foreground">Condition</span><p><Badge className={conditionColors[returnItem.condition] || ""}>{returnItem.condition}</Badge></p></div>
                </div>
                <div><label className="text-sm font-medium">Return Date <span className="text-destructive">*</span></label><input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={returnForm.returnDate} onChange={(e) => setReturnForm((f) => ({ ...f, returnDate: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Return Condition</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={returnForm.condition} onChange={(e) => setReturnForm((f) => ({ ...f, condition: e.target.value }))}>
                    <option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium">Return Notes</label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={returnForm.returnNotes} onChange={(e) => setReturnForm((f) => ({ ...f, returnNotes: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <button onClick={() => setReturnItem(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button onClick={handleReturn} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm flex items-center gap-2">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><RefreshCw className="h-4 w-4" /> Return Asset</>}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
            <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <h2 className="text-lg font-semibold">Delete Assignment</h2>
                <p className="text-sm text-muted-foreground mt-1">Are you sure? This cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="px-4 py-2 bg-destructive text-destructive-foreground rounded text-sm flex items-center gap-2">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4" /> Delete</>}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
