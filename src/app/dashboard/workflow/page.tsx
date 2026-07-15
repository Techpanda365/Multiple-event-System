// app/dashboard/workflow/page.tsx
"use client";

import { useState } from "react";
import {
  ChevronLeft,
  FileText,
  Layers,
  Filter,
  ListChecks,
  GitBranch,
  Plus,
  Trash2,
  X,
  Save,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

// Mock data for modules and sub-modules
const modules = [
  { value: "Select Module", label: "Select Module" },
  { value: "Accounting", label: "Accounting" },
  { value: "Assets", label: "Assets" },
  { value: "HRM", label: "HRM" },
  { value: "Inventory", label: "Inventory" },
  { value: "Sales", label: "Sales" },
  { value: "Purchase", label: "Purchase" },
  { value: "POS", label: "POS" },
  { value: "CRM", label: "CRM" },
  { value: "Project", label: "Project" },
];

const subModules: Record<string, string[]> = {
  "Select Module": ["Select Sub Module"],
  Accounting: [
    "Select Sub Module",
    "Customers",
    "Vendors",
    "Banking",
    "Chart Of Accounts",
    "Revenue",
    "Expense",
  ],
  Assets: [
    "Select Sub Module",
    "Assets",
    "Assignments",
    "Locations",
    "Maintenance",
    "Depreciation",
    "Category",
    "Borrow & Rent",
  ],
  HRM: [
    "Select Sub Module",
    "Employees",
    "Payslip",
    "Attendance",
    "Leave Management",
    "Holidays",
    "Awards",
  ],
  Inventory: ["Select Sub Module", "Items", "Adjustments", "Reports"],
  Sales: [
    "Select Sub Module",
    "Accounts",
    "Contacts",
    "Opportunities",
    "Quotes",
    "Sales Orders",
  ],
  Purchase: [
    "Select Sub Module",
    "Purchase Invoice",
    "Purchase Invoice Returns",
    "Warehouse",
    "Transfers",
  ],
  POS: [
    "Select Sub Module",
    "Add POS",
    "POS Orders",
    "POS Returns",
    "Billing Counters",
  ],
  CRM: ["Select Sub Module", "Leads", "Deals", "Reports"],
  Project: ["Select Sub Module", "Projects", "Project Payments"],
};

const fields = [
  "Select Field",
  "Status",
  "Priority",
  "Category",
  "Type",
  "Amount",
  "Date",
  "User",
  "Asset",
  "Location",
];
const operators = [
  "Select Operator",
  "equals",
  "not equals",
  "contains",
  "not contains",
  "greater than",
  "less than",
];
const actionTypes = [
  "Select Action Types",
  "Send Email",
  "Send Notification",
  "Create Task",
  "Update Status",
  "Assign User",
  "Generate Report",
];

export default function WorkflowPage() {
  const [formData, setFormData] = useState({
    workflowName: "",
    module: "",
    subModule: "",
  });

  const [conditions, setConditions] = useState([
    { id: 1, field: "", operator: "", value: "" },
  ]);

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleConditionChange = (id: number, field: string, value: string) => {
    setConditions((prev) =>
      prev.map((cond) => (cond.id === id ? { ...cond, [field]: value } : cond)),
    );
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now(), field: "", operator: "", value: "" },
    ]);
  };

  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions((prev) => prev.filter((cond) => cond.id !== id));
    }
  };

  const toggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      setSelectedActions((prev) => prev.filter((a) => a !== action));
    } else {
      setSelectedActions((prev) => [...prev, action]);
    }
  };

  const conditionCount = conditions.filter(
    (c) => c.field && c.operator && c.value,
  ).length;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Workflow</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Create Workflow</h1>
        <p className="text-sm text-gray-400 mt-1">Create a new workflow</p>
      </div>

      <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 max-w-3xl mx-auto">
          <form className="space-y-6">
            {/* Workflow Details */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                Workflow Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Workflow Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="workflowName"
                      placeholder="Enter workflow name"
                      value={formData.workflowName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Module <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="module"
                      value={formData.module}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {modules.map((mod) => (
                        <option key={mod.value} value={mod.value}>
                          {mod.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Sub Module <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="subModule"
                      value={formData.subModule}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {(
                        subModules[
                          formData.module as keyof typeof subModules
                        ] || ["Select Sub Module"]
                      ).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-yellow-400" />
                  Conditions
                </h2>
                <button
                  type="button"
                  onClick={addCondition}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </button>
              </div>

              <div className="space-y-3">
                {conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="bg-gray-900 rounded-lg border border-gray-700 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Field
                          </label>
                          <select
                            value={condition.field}
                            onChange={(e) =>
                              handleConditionChange(
                                condition.id,
                                "field",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            {fields.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Operator
                          </label>
                          <select
                            value={condition.operator}
                            onChange={(e) =>
                              handleConditionChange(
                                condition.id,
                                "operator",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            {operators.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            placeholder="Enter value"
                            value={condition.value}
                            onChange={(e) =>
                              handleConditionChange(
                                condition.id,
                                "value",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCondition(condition.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-green-400" />
                Actions
              </h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-left flex items-center justify-between hover:border-gray-500 transition"
                >
                  <span className="text-gray-400">Select Action Types</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition ${showActionDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showActionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {actionTypes.map((action) => (
                      <label
                        key={action}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedActions.includes(action)}
                          onChange={() => toggleAction(action)}
                          className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">{action}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Actions Tags */}
              {selectedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedActions.map((action) => (
                    <span
                      key={action}
                      className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-lg text-xs flex items-center gap-1"
                    >
                      {action}
                      <button
                        type="button"
                        onClick={() => toggleAction(action)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  <span className="text-blue-400 font-medium">
                    {conditionCount}
                  </span>{" "}
                  conditions
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">
                  <span className="text-green-400 font-medium">
                    {selectedActions.length}
                  </span>{" "}
                  action types
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard">
                {" "}
                {/* ✅ Link added */}
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
