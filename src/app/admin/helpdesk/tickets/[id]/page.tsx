"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Paperclip, Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, LinkIcon, Loader2 } from "lucide-react";

interface ReplyData {
  id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
  creator: { id: number; name: string; type: string };
}

interface TicketDetail {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { id: string; name: string; color: string };
  creator: { id: number; name: string; type: string };
  created_at: string;
  replies: ReplyData[];
}

const priorityColors: Record<string, string> = {
  low: "text-blue-600 bg-blue-50 border-blue-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  urgent: "text-red-600 bg-red-50 border-red-200",
};

const statusColors: Record<string, string> = {
  open: "text-blue-600 bg-blue-50 border-blue-200",
  in_progress: "text-yellow-600 bg-yellow-50 border-yellow-200",
  resolved: "text-green-600 bg-green-50 border-green-200",
  closed: "text-gray-600 bg-gray-50 border-gray-200",
};

function normalizeStatus(s: string): string {
  return s === "IN_PROGRESS" ? "in_progress" : s.toLowerCase();
}

function normalizePriority(s: string): string {
  return s.toLowerCase();
}

function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    if (selRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selRef.current);
      }
    }
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      selRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const tool = (cmd: string, val?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    exec(cmd, val);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-1.5 bg-muted/30 border-b flex-wrap">
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Bold" onMouseDown={tool("bold")}><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Italic" onMouseDown={tool("italic")}><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Underline" onMouseDown={tool("underline")}><Underline className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Heading 3" onMouseDown={tool("formatBlock", "<h3>")}><Heading1 className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Heading 4" onMouseDown={tool("formatBlock", "<h4>")}><Heading2 className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Bullet List" onMouseDown={tool("insertUnorderedList")}><List className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Numbered List" onMouseDown={tool("insertOrderedList")}><ListOrdered className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted" title="Insert Link" onMouseDown={(e) => { e.preventDefault(); insertLink(); }}><LinkIcon className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted ml-auto" title="Attach File"><Paperclip className="h-3.5 w-3.5" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[120px] p-3 text-sm focus:outline-none bg-background"
        onInput={handleInput}
        onMouseUp={saveSel}
        onKeyUp={saveSel}
      />
    </div>
  );
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyHtml, setReplyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, { name: string; color: string }>>({});

  useEffect(() => {
    const ticketId = params.id as string;
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch(`/api/admin/helpdesk/tickets/${ticketId}`).then((r) => r.json()),
      fetch("/api/admin/helpdesk/categories").then((r) => r.json()),
    ]).then(([sessionData, ticketData, catData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      const cats: any[] = catData.categories || [];
      const catMap: Record<string, { name: string; color: string }> = {};
      cats.forEach((c: any) => { catMap[c.id] = { name: c.name, color: c.color }; });
      setCategoryMap(catMap);

      if (ticketData.ticket) {
        const t = ticketData.ticket;
        const cat = catMap[t.categoryId] || { name: "Uncategorized", color: "#6B7280" };
        const replies: ReplyData[] = (Array.isArray(t.replies) ? t.replies : []).map((r: any, i: number) => ({
          id: i + 1,
          message: r.text || r.message || "",
          is_internal: r.is_internal || false,
          created_at: r.createdAt || r.created_at || t.createdAt,
          creator: { id: r.author === "Admin" ? 1 : 2, name: r.author || t.creatorName, type: r.author === "Admin" ? "superadmin" : "company" },
        }));
        setTicket({
          id: t.id,
          ticket_id: t.ticketId,
          title: t.title,
          description: t.description || "",
          status: normalizeStatus(t.status),
          priority: normalizePriority(t.priority),
          category: { id: t.categoryId || "", ...cat },
          creator: { id: 0, name: t.creatorName, type: "company" },
          created_at: t.createdAt,
          replies,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  const changeStatus = async (newStatus: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus === "in_progress" ? "IN_PROGRESS" : newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setTicket({ ...ticket, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const sendReply = async () => {
    if (!ticket || !replyHtml.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newReply: replyHtml,
          replyAuthor: userData?.name || "Admin",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          const replies: ReplyData[] = (Array.isArray(data.ticket.replies) ? data.ticket.replies : []).map((r: any, i: number) => ({
            id: i + 1,
            message: r.text || r.message || "",
            is_internal: false,
            created_at: r.createdAt || r.created_at || new Date().toISOString(),
            creator: { id: r.author === "Admin" ? 1 : 2, name: r.author || "Admin", type: r.author === "Admin" ? "superadmin" : "company" },
          }));
          setTicket({ ...ticket, replies });
        }
        setReplyHtml("");
      }
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toISOString().split("T")[0] + " " + dt.toTimeString().split(" ")[0].slice(0, 5);
  };

  if (loading) {
    return (
      <DashboardLayout title="Ticket Details" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout title="Ticket Details" user={userData}>
        <div className="space-y-6 max-w-4xl">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back to Tickets
          </button>
          <div className="bg-card border rounded-xl p-6">
            <h1 className="text-xl font-bold">Ticket not found</h1>
            <p className="text-sm text-muted-foreground mt-2">This ticket does not exist or has been deleted.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${ticket.ticket_id} - ${ticket.title}`} user={userData}>
      <div className="space-y-6 max-w-4xl">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </button>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold">{ticket.ticket_id} - {ticket.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[ticket.status]}`}>
                  {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${priorityColors[ticket.priority]}`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ticket.status === "open" && (
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={() => changeStatus("in_progress")}>Start</Button>
              )}
              {ticket.status === "in_progress" && (
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50" onClick={() => changeStatus("resolved")}>Resolve</Button>
              )}
              {ticket.status === "resolved" && (
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={() => changeStatus("closed")}>Close</Button>
              )}
              {ticket.status === "closed" && (
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => changeStatus("open")}>Re-open</Button>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-4">{ticket.description}</p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                {ticket.category.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="font-medium mt-0.5">{ticket.creator.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created At</p>
              <p className="font-medium mt-0.5">{formatDate(ticket.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">Conversation ({ticket.replies.length} messages)</h2>
          <div className="space-y-4">
            {ticket.replies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No replies yet.</p>
            ) : (
              ticket.replies.map((reply) => {
                const isAdmin = reply.creator.type === "superadmin";
                return (
                  <div key={reply.id} className={`flex gap-3 ${isAdmin ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {reply.creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[70%] ${isAdmin ? "" : "text-right"}`}>
                      <div className={`rounded-xl px-4 py-2.5 text-sm ${isAdmin ? "bg-primary/5 border border-primary/10" : "bg-muted/50 border"}`}>
                        <p className="font-semibold text-xs mb-1">{reply.creator.name}</p>
                        <p className="text-muted-foreground">{reply.message}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{formatDate(reply.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-3">Reply</h2>
          <RichEditor value={replyHtml} onChange={setReplyHtml} />
          <div className="flex justify-end mt-3">
            <Button className="gap-1.5 text-xs rounded-lg h-9" disabled={sending || !replyHtml.trim()} onClick={sendReply}>
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
