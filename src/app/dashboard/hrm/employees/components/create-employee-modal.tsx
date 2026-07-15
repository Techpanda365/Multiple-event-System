// app/dashboard/hrm/employees/components/create-employee-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronLeft, ChevronRight, Upload, Plus, Trash2 } from "lucide-react";

interface CreateEmployeeModalProps {
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

interface Document {
  id: string;
  documentType: string;
  file: File | null;
}

export function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    // Personal
    employeeId: "EMP20260016",
    gender: "",
    dateOfBirth: "",
    biometricEmployeeId: "",
    // Employment
    user: "",
    dateOfJoining: "",
    branch: "",
    designation: "",
    shift: "",
    employmentType: "Full Time",
    department: "",
    // Contact
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelationship: "",
    // Banking - Updated
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    bankIdentifierCode: "",
    bankBranch: "",
    taxPayerId: "",
    // Hours & Rates - Updated
    basicSalary: "",
    hoursPerDay: "",
    daysPerWeek: "",
    ratePerHour: "",
    // Documents
    documents: [] as Document[],
  });

  const [newDocument, setNewDocument] = useState<Document>({
    id: "",
    documentType: "",
    file: null,
  });

  if (!isOpen) return null;

  const tabs = [
    { id: 0, name: "Personal" },
    { id: 1, name: "Employment" },
    { id: 2, name: "Contact" },
    { id: 3, name: "Banking" },
    { id: 4, name: "Hours & Rates" },
    { id: 5, name: "Documents" },
  ];

  const handleNext = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    onClose();
  };

  // Document functions
  const addDocument = () => {
    if (newDocument.documentType && newDocument.file) {
      setFormData({
        ...formData,
        documents: [
          ...formData.documents,
          { ...newDocument, id: Date.now().toString() },
        ],
      });
      setNewDocument({ id: "", documentType: "", file: null });
    }
  };

  const removeDocument = (id: string) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((doc) => doc.id !== id),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Employee</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6 min-h-[350px]">
          {/* Tab 1: Personal */}
          {currentTab === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee Id</label>
                <Input
                  type="text"
                  value={formData.employeeId}
                  disabled
                  className="w-full bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Auto-generated employee ID</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <div className="flex gap-6 pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="h-4 w-4 text-primary"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="h-4 w-4 text-primary"
                    />
                    Female
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="h-4 w-4 text-primary"
                    />
                    Other
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Date Of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Biometric Employee Id</label>
                <Input
                  type="text"
                  placeholder="Enter biometric employee id"
                  value={formData.biometricEmployeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, biometricEmployeeId: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Employment */}
          {currentTab === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  User <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.user}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, user: value })
                  }
                  placeholder="Select User"
                >
                  <option value="user1">John Doe</option>
                  <option value="user2">Jane Smith</option>
                  <option value="user3">Mike Johnson</option>
                  <option value="user4">Sarah Williams</option>
                </SimpleSelect>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Company users will be applicable for create employee.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Date Of Joining <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfJoining: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Branch <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.branch}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, branch: value })
                  }
                  placeholder="Select User first"
                >
                  <option value="main">Main Office</option>
                  <option value="north">North Branch</option>
                  <option value="south">South Branch</option>
                  <option value="west">West Branch</option>
                  <option value="east">East Branch</option>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Designation <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.designation}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, designation: value })
                  }
                  placeholder="Select Department first"
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="consultant">Consultant</option>
                  <option value="analyst">Analyst</option>
                  <option value="executive">Executive</option>
                  <option value="associate">Associate</option>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Shift <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.shift}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, shift: value })
                  }
                  placeholder="Select Shift"
                >
                  <option value="morning">Morning (9:00 AM - 6:00 PM)</option>
                  <option value="evening">Evening (2:00 PM - 11:00 PM)</option>
                  <option value="night">Night (11:00 PM - 8:00 AM)</option>
                  <option value="rotating">Rotating</option>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.employmentType}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, employmentType: value })
                  }
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Department <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.department}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, department: value })
                  }
                  placeholder="Select Branch first"
                >
                  <option value="customer-service">Customer Service</option>
                  <option value="it">Information Technology</option>
                  <option value="operations">Operations</option>
                  <option value="procurement">Procurement</option>
                  <option value="legal">Legal & Compliance</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="marketing">Marketing</option>
                </SimpleSelect>
              </div>
            </div>
          )}

          {/* Tab 3: Contact */}
          {currentTab === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine1: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address Line 2</label>
                <Input
                  type="text"
                  placeholder="Enter Address Line 2"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine2: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter State"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Country <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.country}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, country: value })
                  }
                  placeholder="Enter Country"
                >
                  <option value="india">India</option>
                  <option value="usa">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="canada">Canada</option>
                  <option value="australia">Australia</option>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Postal Code"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Emergency Contact Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="+1234567890"
                  value={formData.emergencyContactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactNumber: e.target.value })
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Format: +{'{country code}'}|{'{phone number}'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Emergency Contact Relationship <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={formData.emergencyContactRelationship}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, emergencyContactRelationship: value })
                  }
                  placeholder="Enter Emergency Contact Relationship"
                >
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="friend">Friend</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other</option>
                </SimpleSelect>
              </div>
            </div>
          )}

          {/* Tab 4: Banking - Updated */}
          {currentTab === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bank Name"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Account Holder Name"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolderName: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bank Identifier Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bank Identifier Code"
                  value={formData.bankIdentifierCode}
                  onChange={(e) =>
                    setFormData({ ...formData, bankIdentifierCode: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bank Branch <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bank Branch"
                  value={formData.bankBranch}
                  onChange={(e) =>
                    setFormData({ ...formData, bankBranch: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Payer Id</label>
                <Input
                  type="text"
                  placeholder="Enter Tax Payer Id"
                  value={formData.taxPayerId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxPayerId: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Hours & Rates - Updated */}
          {currentTab === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter Basic Salary"
                  value={formData.basicSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, basicSalary: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Hours Per Day <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter Hours Per Day"
                  value={formData.hoursPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, hoursPerDay: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Days Per Week <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter Days Per Week"
                  value={formData.daysPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, daysPerWeek: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rate Per Hour <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter Rate Per Hour"
                  value={formData.ratePerHour}
                  onChange={(e) =>
                    setFormData({ ...formData, ratePerHour: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Tab 6: Documents - Updated */}
          {currentTab === 5 && (
            <div className="space-y-4">
              {/* Employee Documents Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Employee Documents</h3>
                
                {/* Add Document Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-muted/5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Type *</label>
                    <SimpleSelect
                      value={newDocument.documentType}
                      onValueChange={(value: string) =>
                        setNewDocument({ ...newDocument, documentType: value })
                      }
                      placeholder="Select Document Type"
                    >
                      <option value="resume">Resume/CV</option>
                      <option value="id-proof">ID Proof</option>
                      <option value="address-proof">Address Proof</option>
                      <option value="degree">Degree Certificate</option>
                      <option value="experience">Experience Letter</option>
                      <option value="passport">Passport</option>
                      <option value="visa">Visa</option>
                      <option value="other">Other</option>
                    </SimpleSelect>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document File *</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDocument}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>

                {/* Document List */}
                {formData.documents.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Uploaded Documents</p>
                    {formData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {doc.documentType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doc.file?.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-sm font-medium">
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter emergency contact name"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <div className="flex gap-2">
            {currentTab === tabs.length - 1 && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentTab === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </div>

          {currentTab === tabs.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Create
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}