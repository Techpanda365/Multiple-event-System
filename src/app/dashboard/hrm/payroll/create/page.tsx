"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string | null;
}

export default function CreatePayrollPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [payDate, setPayDate] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/accounting/bank-accounts")
      .then(res => res.ok ? res.json() : [])
      .then(data => setBanks(Array.isArray(data) ? data : []))
      .catch(() => setBanks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!payPeriodStart || !payPeriodEnd || !payDate) {
      setError("Pay period and pay date are required");
      return;
    }
    const start = new Date(payPeriodStart);
    const end = new Date(payPeriodEnd);
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          frequency,
          month: start.getMonth() + 1,
          year: start.getFullYear(),
          payPeriodStart,
          payPeriodEnd,
          payDate,
          bankAccountId: bankAccountId || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payroll");
      }
      router.push("/dashboard/hrm/payroll");
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
          <Link href="/dashboard/hrm/payroll" className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Payroll</h1>
            <p className="text-sm text-gray-400 mt-1">Set up a new payroll run</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Payroll Details</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter Title"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Payroll Frequency *</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Semi-Monthly">Semi-Monthly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Pay Period</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Pay Period Start *</label>
                <input type="date" value={payPeriodStart} onChange={e => setPayPeriodStart(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Pay Period End *</label>
                <input type="date" value={payPeriodEnd} onChange={e => setPayPeriodEnd(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Pay Date *</label>
              <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Payment</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Bank Account</label>
              <select value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Bank Account</option>
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  banks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.accountNumber ? ` (${b.accountNumber})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Additional</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter any notes..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create Payroll"}
            </button>
            <Link href="/dashboard/hrm/payroll"
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
