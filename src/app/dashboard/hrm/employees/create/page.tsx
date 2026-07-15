"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";
import Link from "next/link";

interface Department { id: string; name: string; }

export default function CreateEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    position: "", departmentId: "", salary: "", hireDate: new Date().toISOString().split("T")[0],
    dateOfBirth: "", gender: "", biometricEmployeeId: "",
    address: "", city: "", state: "", zipCode: "", country: "",
    bankName: "", bankAccountNumber: "", bankRoutingNumber: "",
    hourlyRate: "", overtimeRate: "",
  });

  const [documents, setDocuments] = useState<{ name: string; type: string }[]>([]);
  const addDoc = () => setDocuments(prev => [...prev, { name: "", type: "" }]);
  const removeDoc = (i: number) => setDocuments(prev => prev.filter((_, idx) => idx !== i));
  const handleDocChange = (i: number, field: "name" | "type", value: string) => {
    setDocuments(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  useEffect(() => {
    fetch("/api/hrm/departments")
      .then(res => res.ok ? res.json() : [])
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim()) { setError("First name is required"); return; }
    if (!form.lastName.trim()) { setError("Last name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? Number(form.salary) : null,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          overtimeRate: form.overtimeRate ? Number(form.overtimeRate) : null,
          departmentId: form.departmentId || null,
          hireDate: form.hireDate || undefined,
          dateOfBirth: form.dateOfBirth || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create employee");
      }
      const employee = await res.json();
      // Upload documents
      for (const doc of documents) {
        if (!doc.name.trim()) continue;
        await fetch(`/api/hrm/employees/${employee.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: doc.name, fileType: doc.type || null }),
        });
      }
      router.push("/dashboard/hrm/employees");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/hrm/employees">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Employee</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new employee to the system</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-3xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name <span className="text-red-400">*</span></label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name <span className="text-red-400">*</span></label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Biometric Employee ID</label>
                  <input name="biometricEmployeeId" value={form.biometricEmployeeId} onChange={handleChange} placeholder="Enter biometric employee ID" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Employment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email address" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position</label>
                  <input name="position" value={form.position} onChange={handleChange} placeholder="Enter job position" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <select name="departmentId" value={form.departmentId} onChange={handleChange} className={inputClass}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hire Date</label>
                  <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Salary</label>
                  <input type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="Enter salary" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter address" rows={2} className={inputClass + " resize-none"} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="State" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code</label>
                    <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="ZIP code" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Banking */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Banking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="Enter bank name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} placeholder="Enter account number" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Routing Number</label>
                  <input name="bankRoutingNumber" value={form.bankRoutingNumber} onChange={handleChange} placeholder="Enter routing number" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Hours & Rates */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Hours & Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Hourly Rate</label>
                  <input type="number" name="hourlyRate" value={form.hourlyRate} onChange={handleChange} placeholder="Enter hourly rate" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Overtime Rate</label>
                  <input type="number" name="overtimeRate" value={form.overtimeRate} onChange={handleChange} placeholder="Enter overtime rate" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Documents</h2>
              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input name={`docName-${i}`} value={doc.name} onChange={(e) => handleDocChange(i, "name", e.target.value)} placeholder="Document name" className={inputClass} />
                    </div>
                    <div className="flex-1">
                      <input name={`docType-${i}`} value={doc.type} onChange={(e) => handleDocChange(i, "type", e.target.value)} placeholder="Document type (e.g., PDF, ID Card)" className={inputClass} />
                    </div>
                    <button type="button" onClick={() => removeDoc(i)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition mt-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addDoc} className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
                  + Add Document
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/hrm/employees">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </Link>
              <button type="submit" disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
