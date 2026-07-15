// app/dashboard/hrm/payroll/components/create-payroll-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreatePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple Select component
const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="">{placeholder || "Select..."}</option>
      {children}
    </select>
  );
};

export function CreatePayrollModal({ isOpen, onClose }: CreatePayrollModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    frequency: "",
    periodStart: "",
    periodEnd: "",
    payDate: "",
    bankAccount: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Payroll Data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Payroll</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Payroll Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Payroll Frequency <span className="text-red-500">*</span>
            </label>
            <SimpleSelect
              value={formData.frequency}
              onValueChange={(value: string) =>
                setFormData({ ...formData, frequency: value })
              }
              placeholder="Select Payroll Frequency"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="semi-monthly">Semi-Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </SimpleSelect>
          </div>

          {/* Pay Period Start */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pay Period Start <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.periodStart}
              onChange={(e) =>
                setFormData({ ...formData, periodStart: e.target.value })
              }
              className="w-full"
              placeholder="Select Pay Period Start"
            />
          </div>

          {/* Pay Period End */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pay Period End <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.periodEnd}
              onChange={(e) =>
                setFormData({ ...formData, periodEnd: e.target.value })
              }
              className="w-full"
              placeholder="Select Pay Period End"
            />
          </div>

          {/* Pay Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pay Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.payDate}
              onChange={(e) =>
                setFormData({ ...formData, payDate: e.target.value })
              }
              className="w-full"
              placeholder="Select Pay Date"
            />
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Bank Account <span className="text-red-500">*</span>
            </label>
            <SimpleSelect
              value={formData.bankAccount}
              onValueChange={(value: string) =>
                setFormData({ ...formData, bankAccount: value })
              }
              placeholder="Select Bank Account"
            >
              <option value="account1">Main Bank Account - 1234</option>
              <option value="account2">Secondary Bank Account - 5678</option>
              <option value="account3">Payroll Account - 9012</option>
            </SimpleSelect>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              placeholder="Enter Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}