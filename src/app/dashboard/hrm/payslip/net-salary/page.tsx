"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, DollarSign } from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string | null;
  salary: number | null;
  department: { id: string; name: string } | null;
}

export default function NetSalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/hrm/employees")
      .then(res => res.ok ? res.json() : [])
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number | null) => {
    if (n == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return e.employeeId.toLowerCase().includes(q) || e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Net Salary</h1>
          <p className="text-sm text-gray-400 mt-1">View employee net salary details</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search by employee name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Basic Salary</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Allowances</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Deductions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No employees found</td></tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{emp.employeeId}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{emp.department?.name || "—"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{emp.position || "—"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-white">{fmt(emp.salary)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-400">—</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-400">—</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-white">{fmt(emp.salary)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
