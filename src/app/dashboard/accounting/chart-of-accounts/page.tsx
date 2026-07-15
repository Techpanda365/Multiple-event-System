"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle, Hash, Loader2, X, Save, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Link from "next/link";

type GLAccount = {
  id: string;
  code: string;
  name: string;
  type: string;
  subtype: string | null;
  description: string | null;
  isActive: boolean;
  normalBalance: string;
  openingBalance: number;
  currentBalance: number;
  parentId: string | null;
  parent: { id: string; code: string; name: string } | null;
};

const accountTypes = [
  "Other Income", "Operating Expenses", "Cost of Goods Sold",
  "Sales Revenue", "Current Assets", "Fixed Assets",
  "Current Liabilities", "Long Term Liabilities", "Equity",
];

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewAccount, setViewAccount] = useState<GLAccount | null>(null);
  const [editAccount, setEditAccount] = useState<GLAccount | null>(null);
  const [editForm, setEditForm] = useState({ name: "", type: "", normalBalance: "Debit", openingBalance: "", currentBalance: "", description: "", isActive: true });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteAccount, setDeleteAccount] = useState<GLAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounting/chart-of-accounts");
      if (res.ok) setAccounts(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.includes(search) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEdit = (a: GLAccount) => {
    setEditAccount(a);
    setEditForm({ name: a.name, type: a.type, normalBalance: a.normalBalance, openingBalance: String(a.openingBalance), currentBalance: String(a.currentBalance), description: a.description || "", isActive: a.isActive });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editAccount) return;
    if (!editForm.name.trim()) { setEditError("Name is required"); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/accounting/chart-of-accounts/${editAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          type: editForm.type,
          normalBalance: editForm.normalBalance,
          openingBalance: editForm.openingBalance,
          currentBalance: editForm.currentBalance,
          description: editForm.description.trim() || null,
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) { setEditError("Failed to update"); return; }
      fetchAccounts();
      setEditAccount(null);
    } catch { setEditError("Network error"); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;
    setDeleting(true);
    try {
      await fetch(`/api/accounting/chart-of-accounts/${deleteAccount.id}`, { method: "DELETE" });
      fetchAccounts();
      setDeleteAccount(null);
    } catch { }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span><span className="text-gray-600">/</span><span>Accounting</span><span className="text-gray-600">/</span><span className="text-white">Chart Of Accounts</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Chart Of Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">{accounts.length} accounts</p>
        </div>
        <Link href="/dashboard/accounting/chart-of-accounts/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search accounts..." className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <button onClick={fetchAccounts} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Refresh</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Hash className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No accounts found</p>
              <Link href="/dashboard/accounting/chart-of-accounts/create">
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Add First Account</button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase"><Hash className="w-3 h-3 inline mr-1" />Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Account Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Parent Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Normal Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Opening Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Current Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginated.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4"><span className="text-sm font-mono text-blue-400">{acc.code}</span></td>
                    <td className="px-4 py-4"><span className="text-sm text-white font-medium">{acc.name}</span></td>
                    <td className="px-4 py-4"><span className="text-sm text-gray-400">{acc.type}</span></td>
                    <td className="px-4 py-4">
                      {acc.parent ? (
                        <span className="text-sm text-gray-400">{acc.parent.code} - {acc.parent.name}</span>
                      ) : (
                        <span className="text-sm text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${acc.normalBalance === "Debit" ? "text-orange-400" : "text-purple-400"}`}>
                        {acc.normalBalance === "Debit" ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                        {acc.normalBalance}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right"><span className="text-sm text-gray-300">{fmt(acc.openingBalance)}</span></td>
                    <td className="px-4 py-4 text-right"><span className="text-sm text-gray-300">{fmt(acc.currentBalance)}</span></td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${acc.isActive ? "bg-green-900/50 text-green-400 border border-green-800" : "bg-red-900/50 text-red-400 border border-red-800"}`}>
                        {acc.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {acc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewAccount(acc)} className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(acc)} className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteAccount(acc)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">Page {currentPage} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 hover:bg-gray-700 transition"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-gray-400">{currentPage}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-400 disabled:opacity-50 hover:bg-gray-700 transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Account Details</h2>
                <button onClick={() => setViewAccount(null)} className="p-1 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Code</label><p className="text-white font-mono">{viewAccount.code}</p></div>
                  <div><label className="text-xs text-gray-500">Status</label><p><span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${viewAccount.isActive ? "bg-green-900/50 text-green-400 border border-green-800" : "bg-red-900/50 text-red-400 border border-red-800"}`}>{viewAccount.isActive ? "Active" : "Inactive"}</span></p></div>
                </div>
                <div><label className="text-xs text-gray-500">Account Name</label><p className="text-white text-lg">{viewAccount.name}</p></div>
                <div><label className="text-xs text-gray-500">Account Type</label><p className="text-white">{viewAccount.type}</p></div>
                {viewAccount.parent && <div><label className="text-xs text-gray-500">Parent Account</label><p className="text-gray-300">{viewAccount.parent.code} - {viewAccount.parent.name}</p></div>}
                <div><label className="text-xs text-gray-500">Normal Balance</label><p className="text-white">{viewAccount.normalBalance}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Opening Balance</label><p className="text-white">{fmt(viewAccount.openingBalance)}</p></div>
                  <div><label className="text-xs text-gray-500">Current Balance</label><p className="text-white">{fmt(viewAccount.currentBalance)}</p></div>
                </div>
                {viewAccount.description && <div><label className="text-xs text-gray-500">Description</label><p className="text-gray-300">{viewAccount.description}</p></div>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewAccount(null)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Account</h2>
                <button onClick={() => setEditAccount(null)} className="p-1 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              {editError && <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{editError}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Code</label>
                  <p className="text-white font-mono px-4 py-2 bg-gray-900 rounded-lg">{editAccount.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name <span className="text-red-400">*</span></label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type <span className="text-red-400">*</span></label>
                  <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {accountTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Normal Balance</label>
                  <select value={editForm.normalBalance} onChange={(e) => setEditForm({ ...editForm, normalBalance: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Opening Balance</label>
                    <input type="number" step="0.01" value={editForm.openingBalance} onChange={(e) => setEditForm({ ...editForm, openingBalance: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Balance</label>
                    <input type="number" step="0.01" value={editForm.currentBalance} onChange={(e) => setEditForm({ ...editForm, currentBalance: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-900 border-gray-700" />
                  <span className="text-sm text-gray-300">Is Active</span>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditAccount(null)} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleEditSave} disabled={editSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-lg"><AlertCircle className="w-6 h-6 text-red-400" /></div>
              <h2 className="text-xl font-semibold text-white">Delete Account</h2>
            </div>
            <p className="text-gray-400 mb-4">Delete <strong className="text-white">{deleteAccount.name}</strong> ({deleteAccount.code})? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteAccount(null)} className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
