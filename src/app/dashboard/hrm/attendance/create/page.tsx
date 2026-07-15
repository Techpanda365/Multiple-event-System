// app/dashboard/hrm/attendance/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

export default function CreateAttendancePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    clockIn: "",
    clockOut: "",
    notes: "",
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
    if (!formData.employeeId || !formData.date) {
      setError("Employee and date are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create attendance");
      }
      router.push("/dashboard/hrm/attendance");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hrm/attendance">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Attendance</h1>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Employee <span className="text-red-500">*</span></Label>
                <SimpleSelect value={formData.employeeId} onValueChange={(v: string) => setFormData({ ...formData, employeeId: v })} placeholder="Select Employee">
                  {loading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))
                  )}
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Clock In Time</Label>
                <Input type="time" value={formData.clockIn} onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Clock Out Time</Label>
                <Input type="time" value={formData.clockOut} onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes</Label>
                <textarea placeholder="Enter Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard/hrm/attendance")}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
