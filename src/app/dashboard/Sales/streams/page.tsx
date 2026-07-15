// app/dashboard/sales/streams/page.tsx
"use client";

import { useState } from "react";
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
  Plus,
  X,
  User,
  Building2,
  Target,
  FileText,
  Calendar,
  Clock,
  MessageSquare,
  Share2,
} from "lucide-react";

type Stream = {
  id: string;
  user: string;
  date: string;
  time: string;
  type: "Opportunity" | "Account" | "Contact" | "Document" | "Case";
  parentName: string;
  action: string;
  description: string;
};

const sampleStreams: Stream[] = [
  {
    id: "1",
    user: "Anthony Walker",
    date: "2026-02-07",
    time: "11:34",
    type: "Opportunity",
    parentName: "Educational Technology Platform",
    action: "posted to",
    description: "Opportunity comment: Opportunity created",
  },
  {
    id: "2",
    user: "Michael Brown",
    date: "2026-02-06",
    time: "11:34",
    type: "Account",
    parentName: "Biotechnology Research",
    action: "posted to",
    description: "Account comment: Account profile modified",
  },
  {
    id: "3",
    user: "Company",
    date: "2026-01-31",
    time: "11:34",
    type: "Document",
    parentName: "Document",
    action: "posted to",
    description: "Document comment: Document status changed",
  },
  {
    id: "4",
    user: "Company",
    date: "2026-01-23",
    time: "11:34",
    type: "Document",
    parentName: "Document",
    action: "posted to",
    description: "Document comment: Document shared",
  },
  {
    id: "5",
    user: "John Smith",
    date: "2026-01-21",
    time: "11:34",
    type: "Contact",
    parentName: "Steven Miller",
    action: "posted to",
    description: "Contact comment: Contact details modified",
  },
];

const typeColors: Record<string, string> = {
  Opportunity: "bg-blue-500/10 text-blue-700",
  Account: "bg-green-500/10 text-green-700",
  Contact: "bg-purple-500/10 text-purple-700",
  Document: "bg-yellow-500/10 text-yellow-700",
  Case: "bg-red-500/10 text-red-700",
};

const typeIcons: Record<string, any> = {
  Opportunity: Target,
  Account: Building2,
  Contact: User,
  Document: FileText,
  Case: MessageSquare,
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function StreamsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const totalPages = Math.ceil(sampleStreams.length / itemsPerPage);
  const paginatedStreams = sampleStreams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Streams</h1>
            <p className="text-sm text-muted-foreground">All Streams</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">{sampleStreams.length}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search streams..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
            <div className="text-sm text-muted-foreground">{itemsPerPage} per page</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {paginatedStreams.map((stream) => {
                const Icon = typeIcons[stream.type] || FileText;
                return (
                  <div key={stream.id} className="p-4 md:p-6 hover:bg-muted/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(stream.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-medium text-sm">{stream.user}</span>
                          <span className="text-sm text-muted-foreground">{stream.action}</span>
                          <Badge className={typeColors[stream.type]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {stream.type}
                          </Badge>
                          <span className="text-sm font-medium">{stream.parentName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{stream.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{stream.date}</span>
                          <span>{stream.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sampleStreams.length)} of {sampleStreams.length} results</div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}