"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const branchOptions = [
  "Customer Service Center", "Sales Office", "Regional Office",
  "Corporate Headquarters", "West Branch", "Main Office",
  "East Branch", "South Branch", "North Branch", "Downtown Branch",
];

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

export default function CreateCompanyPolicyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    branch: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.branch) {
      setError("Title and branch are required");
      return;
    }
    setSubmitting(true);
    try {
      let fileUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "policies");
        const uploadRes = await fetch("/api/media", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Failed to upload file");
        const media = await uploadRes.json();
        fileUrl = media.url;
      }

      const res = await fetch("/api/hrm/company-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          branch: formData.branch,
          description: formData.description || undefined,
          fileUrl: fileUrl || undefined,
          fileName: file?.name || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create policy");
      }
      router.push("/dashboard/hrm/company-policies");
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
          <Link href="/dashboard/hrm/company-policies" className="text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Company Policy</h1>
            <p className="text-sm text-gray-400 mt-1">Add a new company policy</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Policy Information</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter Title"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Branch *</label>
              <SimpleSelect value={formData.branch} onValueChange={(v: string) => setFormData({ ...formData, branch: v })} placeholder="Select Branch">
                {branchOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter Description"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Attachment</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-sm file:cursor-pointer hover:file:bg-blue-700" />
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />Browse
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 5MB)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create"}
            </button>
            <Link href="/dashboard/hrm/company-policies" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
