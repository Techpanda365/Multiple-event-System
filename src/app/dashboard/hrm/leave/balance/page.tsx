// app/dashboard/hrm/leave/balance/page.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

type LeaveBalance = {
  leaveType: string;
  total: number;
  used: number;
  available: number;
};

type EmployeeLeaveBalance = {
  employee: string;
  balances: LeaveBalance[];
};

// Sample leave balance data
const sampleBalances: EmployeeLeaveBalance[] = [
  {
    employee: "Roberta Johnson",
    balances: [
      { leaveType: "Annual Leave", total: 21, used: 0, available: 21 },
      { leaveType: "Sick Leave", total: 10, used: 0, available: 10 },
      { leaveType: "Maternity Leave", total: 90, used: 0, available: 90 },
      { leaveType: "Paternity Leave", total: 15, used: 0, available: 15 },
      { leaveType: "Personal Leave", total: 5, used: 0, available: 5 },
      { leaveType: "Bereavement Leave", total: 7, used: 0, available: 7 },
      { leaveType: "Study Leave", total: 30, used: 0, available: 30 },
      { leaveType: "Emergency Leave", total: 3, used: 0, available: 3 },
    ],
  },
  {
    employee: "Dr. Joannie Schroeder III",
    balances: [
      { leaveType: "Annual Leave", total: 21, used: 0, available: 21 },
      { leaveType: "Sick Leave", total: 10, used: 0, available: 10 },
      { leaveType: "Maternity Leave", total: 90, used: 0, available: 90 },
      { leaveType: "Paternity Leave", total: 15, used: 0, available: 15 },
      { leaveType: "Personal Leave", total: 5, used: 0, available: 5 },
      { leaveType: "Bereavement Leave", total: 7, used: 0, available: 7 },
      { leaveType: "Study Leave", total: 30, used: 2, available: 28 },
      { leaveType: "Emergency Leave", total: 3, used: 0, available: 3 },
    ],
  },
  {
    employee: "Mrs. Tia Blick III",
    balances: [
      { leaveType: "Annual Leave", total: 21, used: 0, available: 21 },
      { leaveType: "Sick Leave", total: 10, used: 0, available: 10 },
      { leaveType: "Maternity Leave", total: 90, used: 0, available: 90 },
      { leaveType: "Paternity Leave", total: 15, used: 0, available: 15 },
      { leaveType: "Personal Leave", total: 5, used: 0, available: 5 },
      { leaveType: "Bereavement Leave", total: 7, used: 0, available: 7 },
      { leaveType: "Study Leave", total: 30, used: 1, available: 29 },
      { leaveType: "Emergency Leave", total: 3, used: 0, available: 3 },
    ],
  },
  {
    employee: "Delmer Gusikowski MD",
    balances: [
      { leaveType: "Annual Leave", total: 21, used: 0, available: 21 },
      { leaveType: "Sick Leave", total: 10, used: 0, available: 10 },
      { leaveType: "Maternity Leave", total: 90, used: 0, available: 90 },
      { leaveType: "Paternity Leave", total: 15, used: 0, available: 15 },
      { leaveType: "Personal Leave", total: 5, used: 0, available: 5 },
      { leaveType: "Bereavement Leave", total: 7, used: 0, available: 7 },
      { leaveType: "Study Leave", total: 30, used: 0, available: 30 },
      { leaveType: "Emergency Leave", total: 3, used: 0, available: 3 },
    ],
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function LeaveBalancePage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter employees
  const filteredBalances = sampleBalances.filter((item) =>
    item.employee.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredBalances.length / itemsPerPage);
  const paginatedBalances = filteredBalances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leave Balance</h1>
            <p className="text-sm text-muted-foreground">
              View leave balances for all employees
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Leave Balance Cards */}
        <div className="space-y-8">
          {paginatedBalances.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No employees found
              </CardContent>
            </Card>
          ) : (
            paginatedBalances.map((item) => (
              <Card key={item.employee} className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(item.employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {item.employee}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Employee Leave Balance
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/20 border-b border-border">
                          <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                            Leave Type
                          </th>
                          <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                            Total
                          </th>
                          <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                            Used
                          </th>
                          <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                            Available
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.balances.map((balance, index) => (
                          <tr
                            key={balance.leaveType}
                            className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/5"
                            }`}
                          >
                            <td className="p-3 md:p-4">
                              <span className="font-medium text-sm">
                                {balance.leaveType}
                              </span>
                            </td>
                            <td className="p-3 md:p-4 text-center">
                              <Badge variant="secondary" className="font-mono">
                                {balance.total}
                              </Badge>
                            </td>
                            <td className="p-3 md:p-4 text-center">
                              <Badge 
                                variant="secondary" 
                                className={`font-mono ${
                                  balance.used > 0 ? "bg-yellow-500/10 text-yellow-700" : ""
                                }`}
                              >
                                {balance.used}
                              </Badge>
                            </td>
                            <td className="p-3 md:p-4 text-center">
                              <Badge 
                                className={`font-mono ${
                                  balance.available > 0 
                                    ? "bg-green-500/10 text-green-700" 
                                    : "bg-red-500/10 text-red-700"
                                }`}
                              >
                                {balance.available}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredBalances.length)} of{" "}
              {filteredBalances.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}