import { useEffect, useState } from "react";
import { api, type SupportTicket, type TicketMessage } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { MessageSquare, ChevronRight, X, Send, Clock, Plus, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

const SOURCES = [
  { value: "phone", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "in_person", label: "In Person" },
  { value: "web", label: "Website / Chat" },
  { value: "other", label: "Other" },
];

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

interface NewTicketForm {
  name: string;
  email: string;
  source: string;
  subject: string;
  description: string;
}

const EMPTY_FORM: NewTicketForm = { name: "", email: "", source: "phone", subject: "", description: "" };

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: SupportTicket) => void }) {
  const [form, setForm] = useState<NewTicketForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<NewTicketForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const secret = getSecret()!;

  function set(field: keyof NewTicketForm, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
    setApiError(null);
  }

  function validate() {
    const e: Partial<NewTicketForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (form.description.trim().length < 10) e.description = "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const sourceLabel = SOURCES.find(s => s.value === form.source)?.label ?? form.source;
    try {
      const ticket = await api.createTicket({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `[${sourceLabel}] ${form.subject.trim()}`,
        description: form.description.trim(),
      }, secret);
      onCreated(ticket);
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Log New Ticket</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Customer Name *</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="John Smith"
                className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.name ? "border-destructive" : "border-input"}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="john@example.com"
                className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? "border-destructive" : "border-input"}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Contact Source</label>
            <select
              value={form.source}
              onChange={e => set("source", e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
            <input
              value={form.subject}
              onChange={e => set("subject", e.target.value)}
              placeholder="Brief description of the issue"
              className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.subject ? "border-destructive" : "border-input"}`}
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Description *</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Summarise the customer's issue as discussed…"
              rows={4}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.description ? "border-destructive" : "border-input"}`}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {apiError && <p className="text-xs text-destructive bg-destructive/10 rounded p-2">{apiError}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const secret = getSecret()!;

  useEffect(() => {
    api.getSupportTickets(secret)
      .then((d) => setTickets(d.tickets))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function openTicket(ticket: SupportTicket) {
    setSelected(ticket);
    try {
      const d = await api.getSupportTicket(ticket.id, secret);
      setMessages(d.messages);
    } catch {
      setMessages([]);
    }
  }

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setSendingReply(true);
    try {
      const { message } = await api.replyToTicket(selected.id, reply.trim(), secret);
      setMessages((prev) => [...prev, message]);
      setReply("");
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const { ticket: updated } = await api.updateTicketStatus(selected.id, status, secret);
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <>
      {showNewTicket && (
        <NewTicketModal
          onClose={() => setShowNewTicket(false)}
          onCreated={(ticket) => setTickets((prev) => [ticket, ...prev])}
        />
      )}

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage customer support requests.</p>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Ticket
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-80 shrink-0">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tickets yet</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {tickets.map((ticket, i) => (
                  <div
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className={`px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selected?.id === ticket.id ? "bg-primary/5 border-l-2 border-primary" : ""
                    } ${i < tickets.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.name} · {ticket.email}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    </div>
                    <div className="mt-2">
                      <Badge status={ticket.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[500px]">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Select a ticket to view details</p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl flex flex-col" style={{ minHeight: 500 }}>
                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{selected.subject}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From {selected.name} · {selected.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selected.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selected.createdAt).toLocaleString("en-GB")} · Original message
                    </p>
                    {selected.description}
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 text-sm ${
                        msg.senderType === "admin"
                          ? "bg-primary/10 text-foreground ml-6"
                          : "bg-muted/40 text-foreground mr-6"
                      }`}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleString("en-GB")} ·{" "}
                        {msg.senderType === "admin" ? "BDE Support" : "Customer"}
                      </p>
                      {msg.message}
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-border">
                  <div className="flex gap-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply…"
                      rows={2}
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sendingReply || !reply.trim()}
                      className="bg-primary text-primary-foreground px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
