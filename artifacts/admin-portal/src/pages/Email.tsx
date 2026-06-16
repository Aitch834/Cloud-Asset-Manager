import { useEffect, useState, useRef, useMemo } from "react";
import { api, type EmailTemplate, type AdminEmailSent, type Tenant, type InboxEmail, type FullEmail } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Mail, Send, Clock, FileText, Plus, Trash2, Edit2, Check, X,
  ChevronDown, AlertCircle, Loader2, Eye, RefreshCw, Inbox,
  Reply, Circle, Paperclip, ArrowLeft, Settings, FlaskConical,
  ArrowUp, ArrowDown, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, Eraser,
} from "lucide-react";

const CATEGORIES = ["general", "onboarding", "billing", "support", "compliance"];

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  onboarding: "Onboarding",
  billing: "Billing",
  support: "Support",
  compliance: "Compliance",
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; icon: React.ReactNode }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            active === t.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function CustomerSelect({
  tenants,
  onSelect,
}: {
  tenants: Tenant[];
  onSelect: (email: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-border bg-background hover:bg-muted transition-colors"
      >
        Select customer <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-50 w-72 bg-white border border-border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="w-full px-2 py-1 text-sm border border-border rounded outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No customers found</p>
            )}
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelect(t.contactEmail, t.name);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.contactEmail}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const EMAIL_DISCLAIMER = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;"/><p style="font-size:11px;color:#9ca3af;line-height:1.6;margin:0;">This email and any attachments are confidential and intended solely for the named recipient(s). If you have received this email in error, please notify the sender immediately, delete it from your system, and do not disclose the contents to any other person. The views expressed are those of the individual sender and may not represent BDE Farm Trac. BDE Farm Trac is a trading name of Barnett Davies Enterprises Ltd, registered in England and Wales. This email has been scanned for viruses, but BDE Farm Trac accepts no liability for any damage caused by any virus transmitted by this email.</p>`;

function hasEditorContent(html: string): boolean {
  if (!html) return false;
  const div = document.createElement("div");
  div.innerHTML = html;
  return !!(div.textContent?.trim());
}

function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message…",
  minRows = 8,
  autoFocus = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minRows?: number;
  autoFocus?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSetRef = useRef<string>(value);

  useEffect(() => {
    if (editorRef.current && value !== lastSetRef.current) {
      editorRef.current.innerHTML = value;
      lastSetRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) editorRef.current?.focus();
  }, [autoFocus]);

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    const html = editorRef.current?.innerHTML ?? "";
    lastSetRef.current = html;
    onChange(html);
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? "";
    lastSetRef.current = html;
    onChange(html);
  }

  function ToolBtn({
    cmd, arg, title, children, extraClass = "",
  }: {
    cmd: string; arg?: string; title: string; children: React.ReactNode; extraClass?: string;
  }) {
    return (
      <button
        type="button"
        title={title}
        onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg); }}
        className={`flex items-center justify-center w-7 h-7 rounded text-xs hover:bg-muted active:bg-muted/80 ${extraClass}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/20 select-none">
        <select
          title="Text size"
          defaultValue="3"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => exec("fontSize", e.target.value)}
          className="text-xs border border-border rounded px-1.5 py-0.5 bg-background h-7 mr-1"
        >
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
        </select>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn cmd="bold" title="Bold" extraClass="font-bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn cmd="italic" title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn cmd="underline" title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn cmd="insertUnorderedList" title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn cmd="insertOrderedList" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn cmd="justifyLeft" title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn cmd="justifyCenter" title="Align centre"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn cmd="removeFormat" title="Clear formatting"><Eraser className="w-3.5 h-3.5" /></ToolBtn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight: `${minRows * 1.65}rem` }}
        className="px-3 py-2.5 text-sm focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none"
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function InboxTab() {
  const secret = getSecret()!;
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FullEmail | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyDisclaimer, setReplyDisclaimer] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyResult, setReplyResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  async function load(quiet = false) {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const r = await api.getInbox(secret, 50);
      setEmails(r.emails);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("IMAP") ? msg : `Could not connect to inbox: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function openEmail(e: InboxEmail) {
    setLoadingEmail(true);
    setSelected(null);
    setReplyOpen(false);
    setReplyBody("");
    setReplyResult(null);
    try {
      const r = await api.getEmail(e.uid, secret);
      setSelected(r.email);
      if (!e.seen) {
        await api.markEmailRead(e.uid, true, secret);
        setEmails((prev) => prev.map((m) => m.uid === e.uid ? { ...m, seen: true } : m));
      }
    } catch (err) {
      setError(`Failed to load email: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.deleteInboxEmail(selected.uid, secret);
      setEmails((prev) => prev.filter((e) => e.uid !== selected.uid));
      setSelected(null);
    } catch {}
    finally { setDeleting(false); }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !hasEditorContent(replyBody)) return;
    setReplying(true);
    setReplyResult(null);
    try {
      const body = replyDisclaimer ? replyBody + EMAIL_DISCLAIMER : replyBody;
      const r = await api.replyToEmail(selected.uid, body, secret);
      if (r.sent) {
        setReplyResult({ ok: true, message: "Reply sent successfully" });
        setReplyBody("");
        setReplyOpen(false);
      } else {
        setReplyResult({ ok: false, message: r.reason ?? "Send failed" });
      }
    } catch (err) {
      setReplyResult({ ok: false, message: String(err) });
    } finally {
      setReplying(false);
    }
  }

  const sortedEmails = useMemo(() =>
    [...emails].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "desc" ? db - da : da - db;
    }),
    [emails, sortOrder]
  );

  const unreadCount = emails.filter((e) => !e.seen).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Connecting to inbox…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg">
        <div className="flex items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 text-sm">Could not connect to inbox</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <button onClick={() => load()} className="mt-2 text-xs text-red-700 underline">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ minHeight: 0 }}>
      {/* Email list */}
      <div className={`flex flex-col border-r border-border ${selected || loadingEmail ? "w-80 shrink-0" : "flex-1"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Inbox</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortOrder((o) => o === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={sortOrder === "desc" ? "Showing newest first — click for oldest first" : "Showing oldest first — click for newest first"}
            >
              {sortOrder === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground px-6">
            <Inbox className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No emails in inbox</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {sortedEmails.map((e) => (
              <button
                key={e.uid}
                onClick={() => openEmail(e)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors ${
                  selected?.uid === e.uid ? "bg-primary/5 border-l-2 border-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!e.seen && <Circle className="w-2 h-2 text-primary fill-primary shrink-0" />}
                    <span className={`text-sm truncate ${!e.seen ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                      {e.from}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatDate(e.date)}</span>
                </div>
                <p className={`text-xs mt-0.5 truncate ${!e.seen ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {e.subject}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1">{e.preview}</p>
                  {e.hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Email detail */}
      {loadingEmail && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loadingEmail && selected && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="font-semibold text-base truncate">{selected.subject}</h2>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span>From: <span className="text-foreground">{selected.from}</span></span>
                  {selected.fromEmail !== selected.from && (
                    <span className="font-mono text-xs">{"<"}{selected.fromEmail}{">"}</span>
                  )}
                  <span>·</span>
                  <span>{new Date(selected.date).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setReplyOpen((o) => !o); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-muted-foreground disabled:opacity-50"
                  title="Delete"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5">
              {selected.bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: selected.bodyHtml }}
                  style={{ fontSize: "14px", lineHeight: "1.6" }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                  {selected.body || "(No content)"}
                </pre>
              )}
            </div>

            {/* Reply box */}
            {replyOpen && (
              <div className="mx-6 mb-6 border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
                  <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Replying to {selected.from || selected.fromEmail}
                  </span>
                </div>
                <form onSubmit={handleReply}>
                  <div className="p-4">
                    <RichTextEditor
                      value={replyBody}
                      onChange={setReplyBody}
                      placeholder="Write your reply…"
                      minRows={6}
                      autoFocus
                    />
                  </div>
                  {replyResult && (
                    <div className={`px-4 py-2 text-xs flex items-center gap-2 ${replyResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {replyResult.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {replyResult.message}
                    </div>
                  )}
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-muted/20 flex-wrap">
                    <button
                      type="submit"
                      disabled={replying || !hasEditorContent(replyBody)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {replying ? "Sending…" : "Send Reply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyOpen(false); setReplyBody(""); setReplyResult(null); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replyDisclaimer}
                        onChange={(e) => setReplyDisclaimer(e.target.checked)}
                        className="rounded"
                      />
                      Include email disclaimer
                    </label>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {!loadingEmail && !selected && emails.length > 0 && (
        <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Select an email to read it</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ComposeTab({ tenants, initialTo, initialToName }: { tenants: Tenant[]; initialTo?: string; initialToName?: string }) {
  const secret = getSecret()!;
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [form, setForm] = useState({ to: initialTo ?? "", toName: initialToName ?? "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);

  useEffect(() => {
    api.getEmailTemplates(secret)
      .then((r) => setTemplates(r.templates.filter((t) => t.isActive)))
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setResult(null);
  }

  function applyTemplate(t: EmailTemplate) {
    setForm((p) => ({ ...p, subject: t.subject, body: t.body }));
    setSelectedTemplateId(t.id);
    setResult(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.to.trim() || !form.subject.trim() || !hasEditorContent(form.body)) return;
    setSending(true);
    setResult(null);
    try {
      const body = includeDisclaimer ? form.body + EMAIL_DISCLAIMER : form.body;
      const r = await api.sendEmail(
        {
          to: form.to.trim(),
          toName: form.toName.trim() || undefined,
          subject: form.subject.trim(),
          body,
          templateId: selectedTemplateId ?? undefined,
        },
        secret
      );
      if (r.sent) {
        setResult({ ok: true, message: `Email sent successfully to ${form.to}` });
        setForm({ to: "", toName: "", subject: "", body: "" });
        setSelectedTemplateId(null);
      } else {
        setResult({ ok: false, message: r.reason ?? "Send failed" });
      }
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1">Compose Email</h2>
        <p className="text-sm text-muted-foreground">
          Emails are sent from <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">hello@bdefarmtrac.co.uk</span> via Brevo
        </p>
      </div>

      {!loadingTemplates && templates.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quick Templates</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  selectedTemplateId === t.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">To (email address)</label>
            <input
              value={form.to}
              onChange={(e) => set("to", e.target.value)}
              type="email"
              required
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end pb-0.5">
            <CustomerSelect
              tenants={tenants}
              onSelect={(email, name) => setForm((p) => ({ ...p, to: email, toName: name }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Recipient name (optional)</label>
          <input
            value={form.toName}
            onChange={(e) => set("toName", e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
            placeholder="Email subject…"
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <RichTextEditor
            value={form.body}
            onChange={(html) => set("body", html)}
            placeholder="Write your message here…"
            minRows={12}
          />
        </div>

        {result && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-md text-sm ${result.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {result.ok ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {result.message}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <button
            type="submit"
            disabled={sending || !form.to.trim() || !form.subject.trim() || !hasEditorContent(form.body)}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send Email"}
          </button>
          {(form.to || form.subject || hasEditorContent(form.body)) && (
            <button
              type="button"
              onClick={() => { setForm({ to: "", toName: "", subject: "", body: "" }); setSelectedTemplateId(null); setResult(null); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDisclaimer}
              onChange={(e) => setIncludeDisclaimer(e.target.checked)}
              className="rounded"
            />
            Include email disclaimer
          </label>
        </div>
      </form>
    </div>
  );
}

function SentTab() {
  const secret = getSecret()!;
  const [emails, setEmails] = useState<AdminEmailSent[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<AdminEmailSent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  async function load() {
    setRefreshing(true);
    try {
      const r = await api.getSentEmails(secret);
      setEmails(r.emails);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  function fmt(dt: string) {
    return new Date(dt).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const sortedEmails = useMemo(() =>
    [...emails].sort((a, b) => {
      const da = new Date(a.sentAt).getTime();
      const db = new Date(b.sentAt).getTime();
      return sortOrder === "desc" ? db - da : da - db;
    }),
    [emails, sortOrder]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">Sent Emails</h2>
          <p className="text-sm text-muted-foreground">{emails.length} email{emails.length !== 1 ? "s" : ""} in history</p>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
          <Mail className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No emails sent yet</p>
          <p className="text-xs mt-1">Emails sent from the Compose tab will appear here</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">To</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Subject</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                  <button
                    onClick={() => setSortOrder((o) => o === "desc" ? "asc" : "desc")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    title={sortOrder === "desc" ? "Newest first — click for oldest first" : "Oldest first — click for newest first"}
                  >
                    Sent
                    {sortOrder === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                  </button>
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {sortedEmails.map((e, i) => (
                <tr key={e.id} className={`border-t border-border ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[200px]">{e.toName || e.toAddress}</p>
                    {e.toName && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{e.toAddress}</p>}
                    {e.ticketId && <p className="text-xs text-blue-600">Ticket #{e.ticketId}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="truncate">{e.subject}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{fmt(e.sentAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[e.status] ?? "bg-muted text-muted-foreground"}`}>
                      {e.status}
                    </span>
                    {e.status === "failed" && e.errorMessage && (
                      <p className="text-xs text-red-600 mt-0.5 max-w-[150px] truncate">{e.errorMessage}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPreview(e)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold">{preview.subject}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  To: {preview.toName ? `${preview.toName} <${preview.toAddress}>` : preview.toAddress}
                  {" · "}{new Date(preview.sentAt).toLocaleString("en-GB")}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview.body }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateForm {
  name: string;
  category: string;
  subject: string;
  body: string;
}

const BLANK_FORM: TemplateForm = { name: "", category: "general", subject: "", body: "" };

function TemplatesTab() {
  const secret = getSecret()!;
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TemplateForm>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.getEmailTemplates(secret);
      setTemplates(r.templates);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm(BLANK_FORM);
  }

  function startEdit(t: EmailTemplate) {
    setEditing(t);
    setCreating(false);
    setForm({ name: t.name, category: t.category, subject: t.subject, body: t.body });
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
    setForm(BLANK_FORM);
  }

  async function save() {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const r = await api.updateEmailTemplate(editing.id, form, secret);
        setTemplates((p) => p.map((t) => t.id === editing.id ? r.template : t));
      } else {
        const r = await api.createEmailTemplate(form, secret);
        setTemplates((p) => [...p, r.template]);
      }
      cancel();
    } catch {}
    finally { setSaving(false); }
  }

  async function toggleActive(t: EmailTemplate) {
    try {
      const r = await api.updateEmailTemplate(t.id, { isActive: !t.isActive }, secret);
      setTemplates((p) => p.map((x) => x.id === t.id ? r.template : x));
    } catch {}
  }

  async function deleteTemplate(id: number) {
    setDeleting(id);
    try {
      await api.deleteEmailTemplate(id, secret);
      setTemplates((p) => p.filter((t) => t.id !== id));
    } catch {}
    finally { setDeleting(null); }
  }

  const showForm = creating || editing !== null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Save reusable messages for quick composition</p>
        </div>
        {!showForm && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Template
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted/30 border border-border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-sm mb-4">{creating ? "Create Template" : `Editing: ${editing?.name}`}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Template name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Welcome Email"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Subject line</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Email subject…"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Body</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                rows={10}
                placeholder="Template body (HTML or plain text)…"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-y bg-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving || !form.name.trim() || !form.subject.trim() || !form.body.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Template"}
              </button>
              <button onClick={cancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border border-dashed border-border rounded-xl">
          <FileText className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No templates yet</p>
          <p className="text-xs mt-1">Create reusable templates to speed up email composition</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-colors ${
                t.isActive ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {CATEGORY_LABELS[t.category] ?? t.category}
                  </span>
                  {!t.isActive && (
                    <span className="text-xs text-muted-foreground">(inactive)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.subject}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={() => setPreview(t)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleActive(t)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                  title={t.isActive ? "Deactivate" : "Activate"}
                >
                  {t.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTemplate(t.id)}
                  disabled={deleting === t.id}
                  className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-muted-foreground disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold">{preview.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{preview.subject}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview.body }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmtpSettingsTab() {
  const secret = getSecret()!;
  const [config, setConfig] = useState<{ smtpHost: string; smtpPort: string; smtpUser: string; smtpPassSet: boolean; smtpFrom: string } | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    api.getSmtpConfig(secret)
      .then(setConfig)
      .catch(() => setConfig(null))
      .finally(() => setLoadingConfig(false));
  }, []);

  async function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testTo.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const r = await api.sendTestEmail(testTo.trim(), secret);
      setTestResult({ ok: r.sent, message: r.sent ? `Test email sent to ${testTo}. Check your inbox (and spam folder).` : (r.reason ?? "Send failed — check API server logs for detail.") });
    } catch (err) {
      setTestResult({ ok: false, message: String(err) });
    } finally {
      setTesting(false);
    }
  }

  const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono text-xs bg-muted px-1.5 py-0.5 rounded" : ""}`}>{value}</span>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1">SMTP Configuration</h2>
        <p className="text-sm text-muted-foreground">Current outbound email settings read from environment variables.</p>
      </div>

      <div className="rounded-lg border border-border bg-card mb-8">
        <div className="px-5 py-3 border-b border-border bg-muted/30 rounded-t-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active Settings</p>
        </div>
        <div className="px-5">
          {loadingConfig ? (
            <div className="py-6 flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : config ? (
            <>
              <Row label="SMTP Host" value={config.smtpHost} mono />
              <Row label="SMTP Port" value={config.smtpPort} mono />
              <Row label="SMTP User" value={config.smtpUser} mono />
              <Row label="Password set?" value={config.smtpPassSet ? "✓ Yes (SMTP_PASS is set)" : "✗ No — email sending is disabled"} />
              <Row label="From address" value={config.smtpFrom} mono />
            </>
          ) : (
            <p className="py-4 text-sm text-red-600">Could not load SMTP config.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="px-5 py-3 border-b border-border bg-muted/30 rounded-t-lg flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Send Test Email</p>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Sends a diagnostic email immediately. If it doesn't arrive, check the API server logs — they now show Brevo's SMTP response, accepted/rejected lists, and message ID.
          </p>
          <form onSubmit={handleTest} className="flex gap-3">
            <input
              type="email"
              value={testTo}
              onChange={(e) => { setTestTo(e.target.value); setTestResult(null); }}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
            <button
              type="submit"
              disabled={testing || !testTo.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Test
            </button>
          </form>
          {testResult && (
            <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${testResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {testResult.ok ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-sm font-medium text-amber-900 mb-1">How to fix a misconfigured SMTP_USER</p>
        <p className="text-sm text-amber-800">
          The <span className="font-mono text-xs">SMTP_USER</span> must match the Brevo account that issued your <span className="font-mono text-xs">SMTP_PASS</span> API key. If you created your own Brevo account, set <span className="font-mono text-xs">SMTP_USER</span> in Replit Secrets to your Brevo SMTP login (shown in Brevo → SMTP &amp; API → SMTP tab). Also ensure the <span className="font-mono text-xs">SMTP_FROM</span> address is an authorised sender in that Brevo account.
        </p>
      </div>
    </div>
  );
}

export default function Email() {
  const secret = getSecret()!;
  const params = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(params.get("tab") === "compose" ? "compose" : "inbox");
  const [initialTo] = useState(params.get("to") ?? "");
  const [initialToName] = useState(params.get("toName") ?? "");
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    api.getTenants(secret)
      .then((r) => setTenants(r.tenants))
      .catch(() => {});
  }, []);

  const tabs = [
    { key: "inbox", label: "Inbox", icon: <Inbox className="w-4 h-4" /> },
    { key: "compose", label: "Compose", icon: <Send className="w-4 h-4" /> },
    { key: "sent", label: "Sent", icon: <Clock className="w-4 h-4" /> },
    { key: "templates", label: "Templates", icon: <FileText className="w-4 h-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-0 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Email</h1>
            <p className="text-sm text-muted-foreground">hello@bdefarmtrac.co.uk — inbox, compose &amp; manage</p>
          </div>
        </div>
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className={`${tab === "inbox" ? "flex-1 flex flex-col overflow-hidden" : "flex-1 overflow-y-auto"}`}>
        {tab === "inbox" && <InboxTab />}
        {tab === "compose" && <ComposeTab tenants={tenants} initialTo={initialTo} initialToName={initialToName} />}
        {tab === "sent" && <SentTab />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "settings" && <SmtpSettingsTab />}
      </div>
    </div>
  );
}
