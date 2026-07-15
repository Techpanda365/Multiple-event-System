"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type Employee = { id: string; firstName: string; lastName: string; employeeId: string };

export default function CreateAcknowledgmentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    employeeId: "",
    documentTitle: "",
    assignedBy: "",
    assignedDate: "",
    note: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.employeeId || !formData.documentTitle || !formData.assignedDate) {
      setError("Employee, document title, and assigned date are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/acknowledgments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create acknowledgment");
      }
      router.push("/dashboard/hrm/acknowledgments");
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
          <Link href="/dashboard/hrm/acknowledgments" className="text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Acknowledgment</h1>
            <p className="text-sm text-gray-400 mt-1">Assign a document for acknowledgment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Acknowledgment Information</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Employee *</label>
              <select value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Document Title *</label>
              <input type="text" value={formData.documentTitle} onChange={e => setFormData({ ...formData, documentTitle: e.target.value })} placeholder="e.g. Employee Code of Conduct"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Assigned By</label>
              <input type="text" value={formData.assignedBy} onChange={e => setFormData({ ...formData, assignedBy: e.target.value })} placeholder="e.g. HR Manager"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Assigned Date *</label>
              <input type="date" value={formData.assignedDate} onChange={e => setFormData({ ...formData, assignedDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Note</label>
              <textarea rows={3} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Enter any additional notes"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create"}
            </button>
            <Link href="/dashboard/hrm/acknowledgments" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
