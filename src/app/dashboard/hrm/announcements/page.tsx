// app/dashboard/hrm/announcements/create/page.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// Multi-Select component for Departments
const MultiSelect = ({ value, onValueChange, children, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer flex flex-wrap gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          value.map((item: string) => (
            <span
              key={item}
              className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange(value.filter((v: string) => v !== item));
                }}
                className="hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">{placeholder || "Select Departments"}</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    departments: [] as string[],
    priority: "Low",
    startDate: "",
    endDate: "",
    description: "",
  });

  const departmentOptions = [
    "IT",
    "HR",
    "Finance",
    "Operations",
    "Sales",
    "Marketing",
    "Legal",
    "Procurement",
    "Customer Service",
    "Research & Development",
  ];

  const handleDepartmentToggle = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        description: `This is an AI-generated announcement about "${prev.title}". 
        
Key Points:
• Important update for all employees
• Effective from ${prev.startDate || "immediately"}
• Please review the details carefully
• Contact the ${prev.category || "relevant"} department for questions

For more information, please refer to the attached documents or contact your department head.`,
      }));
      setIsGenerating(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Announcement Data:", formData);
    router.push("/dashboard/hrm/announcements");
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hrm/announcements">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Announcement</h1>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
                />
              </div>

              {/* Announcement Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Announcement Category <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.category}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, category: value })
                  }
                  placeholder="Select Announcement Category"
                >
                  <option value="General Company Information">General Company Information</option>
                  <option value="Vendor & Supplier Communications">Vendor & Supplier Communications</option>
                  <option value="Social & Community Engagement">Social & Community Engagement</option>
                  <option value="Career Development Opportunities">Career Development Opportunities</option>
                  <option value="Performance Review & Feedback">Performance Review & Feedback</option>
                  <option value="Remote Work & Flexibility Updates">Remote Work & Flexibility Updates</option>
                  <option value="Diversity & Inclusion Initiatives">Diversity & Inclusion Initiatives</option>
                  <option value="Emergency & Crisis Communications">Emergency & Crisis Communications</option>
                  <option value="Market & Industry Insights">Market & Industry Insights</option>
                  <option value="Innovation & Research Updates">Innovation & Research Updates</option>
                </SimpleSelect>
              </div>

              {/* Department - Multi Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Department <span className="text-red-500">*</span>
                </label>
                <MultiSelect
                  value={formData.departments}
                  onValueChange={(value: string[]) =>
                    setFormData({ ...formData, departments: value })
                  }
                  placeholder="Select Departments"
                >
                  {departmentOptions.map((dept) => (
                    <div
                      key={dept}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-2 ${
                        formData.departments.includes(dept) ? "bg-primary/10" : ""
                      }`}
                      onClick={() => handleDepartmentToggle(dept)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept)}
                        onChange={() => {}}
                        className="h-4 w-4 text-primary"
                      />
                      {dept}
                    </div>
                  ))}
                </MultiSelect>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {["High", "Medium", "Low"].map((priority) => (
                    <label
                      key={priority}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                        formData.priority === priority
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !formData.title}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Generate Description with AI
                      </>
                    )}
                  </Button>
                </div>
                <textarea
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description && !isGenerating && "✓ Description entered"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/hrm/announcements")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}