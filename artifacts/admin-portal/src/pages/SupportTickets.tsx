import { useEffect, useState } from "react";
import { api, type SupportTicket, type TicketMessage } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { MessageSquare, ChevronRight, X, Send, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage customer support requests.</p>
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

        <div className="flex-1">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a ticket to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl flex flex-col h-full">
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

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
                <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selected.createdAt).toLocaleString("en-GB")} · Original message
                  </p>
                  {selected.message}
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
  );
}
