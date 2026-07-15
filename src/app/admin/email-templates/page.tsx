"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Eye, Copy, Mail, X, Code, Bold, Italic, Underline, List, LinkIcon, Heading1, Heading2, Loader2 } from "lucide-react";

interface EmailTemplate {
  module: string;
  subject: string;
  variables: string[];
}

const DEFAULT_VARIABLES = [
  "{company_name}", "{user_name}", "{user_email}", "{invoice_number}",
  "{invoice_amount}", "{invoice_date}", "{proposal_name}", "{proposal_status}",
  "{customer_name}", "{customer_email}", "{po_number}", "{po_amount}",
  "{revenue_amount}", "{revenue_date}", "{due_date}", "{total_amount}",
  "{site_url}", "{logo_url}", "{current_year}", "{support_email}"
];

export default function EmailTemplatesPage() {
  const [userData, setUserData] = useState<any>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const modules = useMemo(() => [...new Set(templates.map((t) => t.module))], [templates]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/email-templates").then((r) => r.json()),
    ]).then(([sessionData, templatesData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      setTemplates(templatesData.templates || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchSearch = t.module.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "all" || t.module === moduleFilter;
    return matchSearch && matchModule;
  });

  const openEdit = (index: number) => {
    setEditIndex(index);
    setSubject(templates[index].subject);
    setBody("");
    setPreview(false);
  };

  const saveTemplate = async () => {
    if (editIndex === null) return;
    const updated = [...templates];
    updated[editIndex] = { ...updated[editIndex], subject };
    const res = await fetch("/api/admin/email-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: updated }),
    });
    if (res.ok) {
      setTemplates(updated);
      setEditIndex(null);
    }
  };

  return (
    <DashboardLayout title="Email Templates" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground text-sm">Manage your email notification templates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
            className="flex h-9 w-44 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            <option value="all">All Modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Module</th>
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filteredTemplates.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No templates found</td></tr>
              ) : (
                filteredTemplates.map((tpl, i) => {
                  const realIndex = templates.indexOf(tpl);
                  return (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{tpl.module}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{tpl.subject}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(realIndex)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">{templates[editIndex].module} Template</h3>
                <p className="text-sm text-muted-foreground">Edit email template</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIndex(null)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{templates[editIndex].module}</span>
                <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                  {preview ? <Code className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
                  {preview ? "Source" : "Preview"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Body</label>
                {preview ? (
                  <div className="min-h-[300px] rounded-lg border p-4 text-sm bg-white">
                    <div className="max-w-lg mx-auto">
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2"><Mail className="h-6 w-6 text-primary" /></div>
                        <h2 className="text-base font-semibold">{subject.replace(/\{\{(\w+)\}\}/g, "[$1]")}</h2>
                      </div>
                      <div className="space-y-3 text-gray-700" dangerouslySetInnerHTML={{ __html: body }} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"><Bold className="h-3.5 w-3.5" /></button>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"><Italic className="h-3.5 w-3.5" /></button>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"><Underline className="h-3.5 w-3.5" /></button>
                      <span className="text-muted-foreground/30 mx-1">|</span>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-xs"><Heading1 className="h-3.5 w-3.5" /></button>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-xs"><Heading2 className="h-3.5 w-3.5" /></button>
                      <span className="text-muted-foreground/30 mx-1">|</span>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"><List className="h-3.5 w-3.5" /></button>
                      <button type="button" className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"><LinkIcon className="h-3.5 w-3.5" /></button>
                    </div>
                    <div contentEditable suppressContentEditableWarning
                      className="w-full min-h-[300px] p-3 text-sm focus-visible:outline-none bg-background"
                      onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Available Variables</p>
                <div className="flex flex-wrap gap-2">
                  {(templates[editIndex]?.variables || DEFAULT_VARIABLES).map((v) => (
                    <button key={v} onClick={() => navigator.clipboard.writeText(v)}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground">
                      {v}<Copy className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <Button variant="outline" onClick={() => setEditIndex(null)}>Cancel</Button>
              <Button onClick={saveTemplate}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
