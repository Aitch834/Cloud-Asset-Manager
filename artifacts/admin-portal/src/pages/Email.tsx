import { useEffect, useState } from "react";
import { api, type EmailTemplate, type AdminEmailSent, type Tenant } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Mail, Send, Clock, FileText, Plus, Trash2, Edit2, Check, X,
  ChevronDown, AlertCircle, Loader2, Eye, RefreshCw,
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

function ComposeTab({ tenants }: { tenants: Tenant[] }) {
  const secret = getSecret()!;
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [form, setForm] = useState({ to: "", toName: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

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
    if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const r = await api.sendEmail(
        {
          to: form.to.trim(),
          toName: form.toName.trim() || undefined,
          subject: form.subject.trim(),
          body: form.body.trim(),
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
          <textarea
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            required
            rows={12}
            placeholder="Write your message here…

HTML is supported for formatting (e.g. <p>, <strong>, <a href=...>).
Plain text also works fine."
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-y"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            HTML is supported — the message is automatically wrapped in the BDE Farm Trac branded email layout.
          </p>
        </div>

        {result && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-md text-sm ${result.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {result.ok ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {result.message}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={sending || !form.to.trim() || !form.subject.trim() || !form.body.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send Email"}
          </button>
          {(form.to || form.subject || form.body) && (
            <button
              type="button"
              onClick={() => { setForm({ to: "", toName: "", subject: "", body: "" }); setSelectedTemplateId(null); setResult(null); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
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
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Sent</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {emails.map((e, i) => (
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
              <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {preview.body}
              </div>
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
              <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {preview.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Email() {
  const secret = getSecret()!;
  const [tab, setTab] = useState("compose");
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    api.getTenants(secret)
      .then((r) => setTenants(r.tenants))
      .catch(() => {});
  }, []);

  const tabs = [
    { key: "compose", label: "Compose", icon: <Send className="w-4 h-4" /> },
    { key: "sent", label: "Sent", icon: <Clock className="w-4 h-4" /> },
    { key: "templates", label: "Templates", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-0 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Email</h1>
            <p className="text-sm text-muted-foreground">Send and manage emails via hello@bdefarmtrac.co.uk</p>
          </div>
        </div>
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "compose" && <ComposeTab tenants={tenants} />}
        {tab === "sent" && <SentTab />}
        {tab === "templates" && <TemplatesTab />}
      </div>
    </div>
  );
}
