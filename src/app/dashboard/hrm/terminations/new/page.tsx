"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CreateTerminationPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    terminationType: "",
    noticeDate: "",
    terminationDate: "",
    reason: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/hrm/employees")
      .then(res => res.ok ? res.json() : [])
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.employeeId || !formData.terminationType || !formData.noticeDate || !formData.terminationDate) {
      setError("Employee, termination type, notice date and termination date are required");
      return;
    }
    setSubmitting(true);
    try {
      let document = "";
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "terminations");
        const uploadRes = await fetch("/api/media", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Failed to upload document");
        const media = await uploadRes.json();
        document = media.url;
      }

      const res = await fetch("/api/hrm/terminations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, document: document || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create termination");
      }
      router.push("/dashboard/hrm/terminations");
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
          <Link href="/dashboard/hrm/terminations" className="text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Termination</h1>
            <p className="text-sm text-gray-400 mt-1">Record an employee termination</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Termination Details</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Employee *</label>
              <select value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Employee</option>
                {loading ? <option disabled>Loading...</option> : (
                  employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Termination Type *</label>
              <select value={formData.terminationType} onChange={e => setFormData({ ...formData, terminationType: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Type</option>
                <option value="Voluntary">Voluntary</option>
                <option value="Involuntary">Involuntary</option>
                <option value="Mutual">Mutual</option>
                <option value="Layoff">Layoff</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notice Date *</label>
                <input type="date" value={formData.noticeDate} onChange={e => setFormData({ ...formData, noticeDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Termination Date *</label>
                <input type="date" value={formData.terminationDate} onChange={e => setFormData({ ...formData, terminationDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Reason</label>
              <input type="text" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Company restructuring"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter Description"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Document</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Browse</span>
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
            <Link href="/dashboard/hrm/terminations" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
