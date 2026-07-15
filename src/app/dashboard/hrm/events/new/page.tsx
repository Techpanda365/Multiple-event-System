"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const period = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m} ${period}`;
});

const departmentOptions = [
  "IT", "HR", "Finance", "Operations", "Sales",
  "Marketing", "Legal", "Procurement", "Customer Service", "R&D",
];

const eventTypes = [
  "Holiday Party", "Team Building", "Onboarding", "Interview",
  "Sales Presentation", "Product Demo", "Client Meeting", "Board Meeting",
  "Town Hall", "Webinar", "Workshop", "Conference", "Training", "Team Meeting",
];

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const MultiSelect = ({ value, onValueChange, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = (opt: string) => {
    onValueChange(value.includes(opt) ? value.filter((v: string) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="relative">
      <div className="w-full min-h-[42px] px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-pointer flex flex-wrap gap-1" onClick={() => setIsOpen(!isOpen)}>
        {value.length > 0 ? value.map((item: string) => (
          <span key={item} className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs flex items-center gap-1">
            {item}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(item); }} className="hover:text-red-400">&times;</button>
          </span>
        )) : <span className="text-gray-500">Select Departments</span>}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt: string) => (
            <div key={opt} className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 flex items-center gap-2 ${value.includes(opt) ? "bg-blue-500/10" : ""}`} onClick={() => toggle(opt)}>
              <input type="checkbox" checked={value.includes(opt)} onChange={() => {}} className="h-4 w-4 text-blue-500" />
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    departments: [] as string[],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    color: "#3b82f6",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.eventType || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      setError("Title, event type, dates, and times are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          departments: formData.departments.length > 0 ? formData.departments.join(",") : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      router.push("/dashboard/hrm/events");
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
          <Link href="/dashboard/hrm/events" className="text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Event</h1>
            <p className="text-sm text-gray-400 mt-1">Schedule a new event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Event Information</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter Title"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Event Type *</label>
              <SimpleSelect value={formData.eventType} onValueChange={(v: string) => setFormData({ ...formData, eventType: v })} placeholder="Select Event Type">
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Departments *</label>
              <MultiSelect value={formData.departments} onValueChange={(v: string[]) => setFormData({ ...formData, departments: v })} options={departmentOptions} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Start Date *</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">End Date *</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Start Time *</label>
                <SimpleSelect value={formData.startTime} onValueChange={(v: string) => setFormData({ ...formData, startTime: v })} placeholder="Select Start Time">
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SimpleSelect>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">End Time *</label>
                <SimpleSelect value={formData.endTime} onValueChange={(v: string) => setFormData({ ...formData, endTime: v })} placeholder="Select End Time">
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SimpleSelect>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Location *</label>
              <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Enter Location"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Color</label>
              <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded-md border border-gray-700 cursor-pointer p-0.5 bg-transparent" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter Description"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating..." : "Create"}
            </button>
            <Link href="/dashboard/hrm/events" className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
