import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { api } from "@/lib/api";
import {
  CheckCircle2, Loader2, LifeBuoy, Clock, MessageSquare, Hash,
  Paperclip, X, FileText, Image, ChevronRight, ArrowLeft, Send,
  RefreshCw, Plus,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface SupportTicket {
  id: number;
  ticketRef: string | null;
  subject: string;
  description: string;
  status: string;
  source: string;
  name: string;
  email: string;
  createdAt: string;
  farmId: number | null;
  tenantSlug: string | null;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: string;
  message: string;
  createdAt: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "compliance", label: "Red Tractor Compliance" },
  { value: "account", label: "Account & Access" },
  { value: "data", label: "Data & Records" },
  { value: "general", label: "General Enquiry" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_LABEL = "Images (JPG, PNG, GIF, WebP), PDF, Word documents, or text files";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image className="w-3.5 h-3.5 text-blue-500" />;
  return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
}

// ── My Tickets tab ───────────────────────────────────────────────────────────

function MyTickets({ farmId }: { farmId: number }) {
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const qc = useQueryClient();

  const ticketsQ = useQuery<{ tickets: SupportTicket[] }>({
    queryKey: ["support-tickets", farmId],
    queryFn: () => api.get(`/farms/${farmId}/support-tickets`),
    staleTime: 30_000,
  });

  const detailQ = useQuery<{ ticket: SupportTicket; messages: TicketMessage[] }>({
    queryKey: ["support-ticket", farmId, selected?.id],
    queryFn: () => api.get(`/farms/${farmId}/support-tickets/${selected!.id}`),
    enabled: !!selected,
    staleTime: 15_000,
  });

  const replyMut = useMutation({
    mutationFn: (message: string) =>
      api.post(`/farms/${farmId}/support-tickets/${selected!.id}/reply`, { message }),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["support-ticket", farmId, selected?.id] });
      qc.invalidateQueries({ queryKey: ["support-tickets", farmId] });
    },
  });

  const tickets = ticketsQ.data?.tickets ?? [];

  if (selected) {
    const ticket = detailQ.data?.ticket ?? selected;
    const messages = detailQ.data?.messages ?? [];

    return (
      <div className="space-y-4">
        <button
          onClick={() => { setSelected(null); setReplyText(""); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all tickets
        </button>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge status={ticket.status} />
                {ticket.ticketRef && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Hash className="w-3 h-3" />{ticket.ticketRef}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-foreground">{ticket.subject}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Raised {formatDate(ticket.createdAt)}</p>
            </div>
            <button
              onClick={() => detailQ.refetch()}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${detailQ.isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3 max-h-[420px] overflow-y-auto">
            <div className="bg-muted/40 rounded-lg p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(ticket.createdAt)} · Your original message
              </p>
              <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {detailQ.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.senderType === "admin"
                      ? "bg-primary/10 ml-6"
                      : "bg-muted/40 mr-6"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(msg.createdAt)} ·{" "}
                    {msg.senderType === "admin" ? (
                      <span className="text-primary font-semibold">BDE Farm Trac Support</span>
                    ) : (
                      "You"
                    )}
                  </p>
                  <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {ticket.status !== "closed" && (
            <div className="px-5 py-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Add a reply</p>
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply or additional information…"
                  rows={2}
                  className="flex-1 resize-none text-sm"
                />
                <Button
                  onClick={() => replyMut.mutate(replyText.trim())}
                  disabled={!replyText.trim() || replyMut.isPending}
                  className="shrink-0 self-end"
                >
                  {replyMut.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Send className="w-3.5 h-3.5 mr-1.5" />Send</>
                  }
                </Button>
              </div>
              {replyMut.isError && (
                <p className="text-xs text-destructive mt-1.5">Failed to send reply. Please try again.</p>
              )}
            </div>
          )}

          {ticket.status === "closed" && (
            <div className="px-5 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">This ticket is closed. Raise a new ticket if you need further help.</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (ticketsQ.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (ticketsQ.isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground text-sm">Could not load your tickets. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => ticketsQ.refetch()}>Retry</Button>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="p-10 text-center">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-sm font-medium text-foreground mb-1">No support tickets yet</p>
        <p className="text-xs text-muted-foreground">Use the "New Ticket" tab to raise a support request.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => setSelected(ticket)}
          className="w-full text-left"
        >
          <Card className="px-4 py-3.5 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={ticket.status} />
                  {ticket.ticketRef && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-primary/80 bg-primary/8 px-1.5 py-0.5 rounded">
                      <Hash className="w-3 h-3" />{ticket.ticketRef}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(ticket.createdAt)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

// ── New Ticket form ──────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "", email: "", category: "technical", subject: "", description: "",
};

function NewTicketForm({ farmId, tenantSlug, onSubmitted }: {
  farmId: number | null;
  tenantSlug: string | null;
  onSubmitted: () => void;
}) {
  const { user: clerkUser } = useSafeUser();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (clerkUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "",
        email: prev.email || clerkUser.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [clerkUser]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    setAttachmentError(null);
    const incoming = Array.from(selected);
    const combined = [...attachments];
    for (const file of incoming) {
      if (combined.length >= MAX_FILES) { setAttachmentError(`Maximum ${MAX_FILES} files allowed.`); break; }
      if (!ALLOWED_TYPES.includes(file.type)) { setAttachmentError(`"${file.name}" is not an allowed type. ${ALLOWED_LABEL}.`); continue; }
      if (file.size > MAX_FILE_SIZE) { setAttachmentError(`"${file.name}" exceeds 5 MB (${formatBytes(file.size)}).`); continue; }
      if (combined.find((f) => f.name === file.name && f.size === file.size)) continue;
      combined.push(file);
    }
    setAttachments(combined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Please provide at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category;
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("subject", `[${categoryLabel}] ${form.subject.trim()}`);
      fd.append("description", form.description.trim());
      fd.append("source", "app");
      if (farmId) fd.append("farmId", String(farmId));
      if (tenantSlug) fd.append("tenantSlug", tenantSlug);
      for (const file of attachments) fd.append("attachments", file, file.name);

      const res = await fetch("/api/support/tickets", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTicketRef(data.ticketRef ?? null);
    } catch {
      toast({ title: "Submission Failed", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (ticketRef) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-1">Ticket Submitted</h2>
        <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-lg px-4 py-2 mb-4 mt-2">
          <Hash className="w-4 h-4" />
          <span className="font-mono font-bold text-lg tracking-wider">{ticketRef}</span>
        </div>
        <p className="text-muted-foreground text-sm mb-2">
          We've received your request and sent a confirmation to <strong>{form.email}</strong>.
        </p>
        <p className="text-muted-foreground text-xs mb-6">
          Keep your reference handy — you can also track it in the "My Tickets" tab.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            variant="outline"
            onClick={() => { setForm((p) => ({ ...EMPTY_FORM, name: p.name, email: p.email })); setTicketRef(null); setAttachments([]); }}
          >
            Submit Another
          </Button>
          <Button onClick={onSubmitted}>
            View My Tickets
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your Name *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Smith" className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Reply Email *</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" className={errors.email ? "border-destructive" : ""} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Subject *</label>
          <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Brief description of your issue" className={errors.subject ? "border-destructive" : ""} />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description *</label>
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe your issue in detail. Include any error messages, steps already tried, and what you expected to happen."
            rows={6}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          <p className="text-xs text-muted-foreground">{form.description.length} characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Attachments <span className="font-normal text-muted-foreground">(optional)</span></label>
          {attachments.length > 0 && (
            <ul className="space-y-1.5">
              {attachments.map((file, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/40 text-sm">
                  <FileIcon type={file.type} />
                  <span className="flex-1 truncate text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                  <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="ml-1 rounded hover:bg-destructive/10 p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {attachments.length < MAX_FILES && (
            <>
              <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt" className="sr-only" onChange={(e) => handleFiles(e.target.files)} id="support-attachments" />
              <label htmlFor="support-attachments" className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-dashed border-border bg-background hover:bg-muted/40 cursor-pointer transition-colors text-sm text-muted-foreground">
                <Paperclip className="w-4 h-4 shrink-0" />
                <span>{attachments.length === 0 ? "Attach screenshots or documents" : `Add more files (${MAX_FILES - attachments.length} remaining)`}</span>
              </label>
            </>
          )}
          {attachmentError && <p className="text-xs text-destructive">{attachmentError}</p>}
          <p className="text-xs text-muted-foreground">Up to {MAX_FILES} files · 5 MB each · {ALLOWED_LABEL}</p>
        </div>

        <Button type="submit" className="w-full h-11" disabled={submitting}>
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Submit Ticket"}
        </Button>
      </form>
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

type Tab = "my-tickets" | "new-ticket";

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { farmId, tenantSlug } = useAppStore();
  const [tab, setTab] = useState<Tab>("my-tickets");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "my-tickets", label: "My Tickets", icon: MessageSquare },
    { id: "new-ticket", label: "New Ticket", icon: Plus },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Support</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Track your open requests and get in touch with our team.
          </p>
        </div>

        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "my-tickets" ? (
          farmId ? (
            <MyTickets farmId={farmId} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No farm selected — please select a farm to view your support tickets.</p>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NewTicketForm
                farmId={farmId}
                tenantSlug={tenantSlug}
                onSubmitted={() => setTab("my-tickets")}
              />
            </div>
            <div className="space-y-4">
              <Card className="p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What to Expect</p>
                <InfoCard icon={Hash} title="Ticket Reference" body="You'll receive a unique BDE-YYMM-NNNN reference and an email confirmation instantly." />
                <InfoCard icon={Clock} title="Response Time" body="We aim to respond within 1 business day, Mon–Fri." />
                <InfoCard icon={MessageSquare} title="Track Progress" body="All replies appear in your My Tickets tab — no need to dig through email." />
                <InfoCard icon={LifeBuoy} title="Help Centre" body="Check the Help Centre for instant answers to common questions." />
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
