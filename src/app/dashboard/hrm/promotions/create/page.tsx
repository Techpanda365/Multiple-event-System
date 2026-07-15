"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  department: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    currentBranch: "",
    currentDepartment: "",
    currentDesignation: "",
    effectiveDate: "",
    reason: "",
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/hrm/employees").then(r => r.ok ? r.json() : []),
      fetch("/api/hrm/departments").then(r => r.ok ? r.json() : []),
    ]).then(([emps, depts]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setDepartments(Array.isArray(depts) ? depts : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleEmployeeChange = (id: string) => {
    setFormData({ ...formData, employeeId: id });
    const emp = employees.find(e => e.id === id) || null;
    setSelectedEmployee(emp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.employeeId || !formData.effectiveDate) {
      setError("Employee and effective date are required");
      return;
    }
    setSubmitting(true);
    try {
      let document = "";
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "promotions");
        const uploadRes = await fetch("/api/media", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Failed to upload document");
        const media = await uploadRes.json();
        document = media.url;
      }

      const res = await fetch("/api/hrm/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          previousBranch: selectedEmployee?.department?.name || null,
          previousDepartment: selectedEmployee?.department?.name || null,
          previousDesignation: selectedEmployee?.position || null,
          document: document || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create promotion");
      }
      router.push("/dashboard/hrm/promotions");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/hrm/promotions" className="text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Promotion</h1>
            <p className="text-sm text-gray-400 mt-1">Promote an employee to a new position</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

          {/* Current Info (read-only) */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Current Information</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Employee *</label>
              <select value={formData.employeeId} onChange={e => handleEmployeeChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Employee</option>
                {loading ? <option disabled>Loading...</option> : (
                  employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))
                )}
              </select>
            </div>
            {selectedEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Current Department</label>
                  <p className="text-sm text-white">{selectedEmployee.department?.name || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Current Designation</label>
                  <p className="text-sm text-white">{selectedEmployee.position || "—"}</p>
                </div>
              </div>
            )}
          </div>

          {/* New Info */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Promotion Details</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Current Branch</label>
              <input type="text" value={formData.currentBranch} onChange={e => setFormData({ ...formData, currentBranch: e.target.value })} placeholder="Enter branch name"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Current Department</label>
              <select value={formData.currentDepartment} onChange={e => setFormData({ ...formData, currentDepartment: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Current Designation</label>
              <input type="text" value={formData.currentDesignation} onChange={e => setFormData({ ...formData, currentDesignation: e.target.value })} placeholder="Enter designation"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Effective Date *</label>
              <input type="date" value={formData.effectiveDate} onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Reason</label>
              <textarea rows={3} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Enter Reason"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Document</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Select Document</span>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => setFileName(e.target.files?.[0]?.name || "")} />
                </label>
                <span className="text-sm text-gray-400">{fileName || "No file chosen"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create"}
            </button>
            <Link href="/dashboard/hrm/promotions" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
