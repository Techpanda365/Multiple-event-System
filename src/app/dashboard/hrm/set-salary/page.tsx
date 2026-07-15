// app/dashboard/hrm/salary/page.tsx
"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  DollarSign,
} from "lucide-react";

type Employee = {
  id: string;
  employeeId: string;
  name: string;
  branch: string;
  department: string;
  designation: string;
  basicSalary: string;
  avatar?: string;
};

// Simple Select component for filter
const FilterSelect = ({ value, onValueChange, children }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </select>
  );
};

// Simple Modal component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Sample salary data
const sampleEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP20260015",
    name: "Delmer Gusikowski MD",
    branch: "Customer Service Center",
    department: "Research & Development",
    designation: "Manager",
    basicSalary: "64.387.565",
  },
  {
    id: "2",
    employeeId: "EMP20260014",
    name: "Mrs. Tia Blick III",
    branch: "Sales Office",
    department: "Customer Service",
    designation: "Assistant",
    basicSalary: "60.864.925",
  },
  {
    id: "3",
    employeeId: "EMP20260013",
    name: "Dr. Joannie Schroeder II",
    branch: "Main Office",
    department: "Sales & Marketing",
    designation: "Specialist",
    basicSalary: "44.792.415",
  },
  {
    id: "4",
    employeeId: "EMP20260012",
    name: "Roberta Johnson",
    branch: "West Branch",
    department: "Legal & Compliance",
    designation: "Senior Associate",
    basicSalary: "38.083.225",
  },
  {
    id: "5",
    employeeId: "EMP20260011",
    name: "Abby Beier",
    branch: "East Branch",
    department: "Sales & Marketing",
    designation: "Executive",
    basicSalary: "73.073.655",
  },
  {
    id: "6",
    employeeId: "EMP20260010",
    name: "Mark Allen",
    branch: "Corporate Headquarters",
    department: "Production",
    designation: "Assistant Manager",
    basicSalary: "62.896.975",
  },
  {
    id: "7",
    employeeId: "EMP20260009",
    name: "Anthony Walker",
    branch: "Main Office",
    department: "Customer Service",
    designation: "Senior Consultant",
    basicSalary: "54.014.395",
  },
  {
    id: "8",
    employeeId: "EMP20260008",
    name: "Matthew Clark",
    branch: "Main Office",
    department: "Customer Service",
    designation: "Administrator",
    basicSalary: "77.884.865",
  },
  {
    id: "9",
    employeeId: "EMP20260007",
    name: "Daniel Thompson",
    branch: "Main Office",
    department: "Operations",
    designation: "Associate",
    basicSalary: "48.084.655",
  },
  {
    id: "10",
    employeeId: "EMP20260006",
    name: "Christopher Lee",
    branch: "West Branch",
    department: "Legal & Compliance",
    designation: "Senior Associate",
    basicSalary: "70.919.985",
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

const formatCurrency = (value: string) => {
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function SetSalaryPage() {
  const [employees] = useState<Employee[]>(sampleEmployees);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSalary, setEditSalary] = useState("");

  // Get unique branches for filter
  const uniqueBranches = useMemo(() => {
    const branches = new Set(employees.map((emp) => emp.branch));
    return Array.from(branches);
  }, [employees]);

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(employees.map((emp) => emp.department));
    return Array.from(depts);
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.employeeId.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          emp.designation.toLowerCase().includes(q)
      );
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((emp) => emp.branch === branchFilter);
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    return filtered;
  }, [employees, search, branchFilter, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditSalary(employee.basicSalary);
    setIsEditModalOpen(true);
  };

  const handleSaveSalary = () => {
    console.log(`Updated salary for ${selectedEmployee?.name}: ${editSalary}`);
    setIsEditModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Set Salary</h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by employee name or ID."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect
              value={branchFilter}
              onValueChange={(value) => {
                setBranchFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Branches</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={departmentFilter}
              onValueChange={(value) => {
                setDepartmentFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </FilterSelect>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Salary Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Employee Name
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Department
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Basic Salary
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((employee, index) => (
                        <tr
                          key={employee.id}
                          className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/5"
                          }`}
                        >
                          <td className="p-3 md:p-4">
                            <span className="font-mono text-xs font-medium">
                              {employee.employeeId}
                            </span>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(employee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{employee.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="text-sm">{employee.branch}</span>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="text-sm">{employee.department}</span>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="text-sm">{employee.designation}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className="text-sm font-medium">
                              {formatCurrency(employee.basicSalary)}
                            </span>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} entries
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

      {/* Edit Salary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Basic Salary"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedEmployee.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedEmployee.name}</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.employeeId}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Basic Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveSalary}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}